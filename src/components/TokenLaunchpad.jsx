import {
  MINT_SIZE,
  TOKEN_2022_PROGRAM_ID,
  getMetadataPointerState,
  createInitializeMetadataPointerInstruction,
  TYPE_SIZE,
  LENGTH_SIZE,
  getMintLen,
  createInitializeMintInstruction,
  ExtensionType,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccount,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";
import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  SystemProgram,
  Transaction,
  Connection,
} from "@solana/web3.js";

export function TokenLaunchpad() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [name, setName] = useState();
  const [symbol, setSymbol] = useState();
  const [image, setImage] = useState();
  const [supply, setSupply] = useState();

  async function create() {
    try {
      if (!wallet.publicKey) alert(Error("connect your wallet"));

      const mintKeypair = Keypair.generate();

      const metaData = {
        updateAuthority: wallet.publicKey,
        mint: mintKeypair.publicKey,
        name: name,
        symbol: symbol,
        uri: "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/DeveloperPortal/metadata.json",
        additionalMetadata: [],
      };
      const mintLen = getMintLen([ExtensionType.MetadataPointer]);
      const metadataExtension = TYPE_SIZE + LENGTH_SIZE;
      const metadataLen = pack(metaData).length;

      const lamports = await connection.getMinimumBalanceForRentExemption(
        mintLen + metadataExtension + metadataLen
      );

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_2022_PROGRAM_ID,
        })
      );

      createInitializeMetadataPointerInstruction(
        mintKeypair.publicKey,
        wallet.publicKey,
        mintKeypair.publicKey,
        TOKEN_2022_PROGRAM_ID
      );

      createInitializeMintInstruction(
        mintKeypair.publicKey,
        9,
        wallet.publicKey,
        wallet.publicKey,
        TOKEN_2022_PROGRAM_ID
      );

      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        updateAuthority: wallet.publicKey,
        mint: mintKeypair.publicKey,
        mintAuthority: wallet.publicKey,
        metadata: mintKeypair.publicKey,
        name: metaData.name,
        symbol: metaData.symbol,
        uri: metaData.uri,
      });

      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;

      transaction.partialSign(mintKeypair);
      await wallet.sendTransaction(transaction, connection);
      console.log(`Token mint created at ${mintKeypair.publicKey.toBase58()}`);

      const associatedToken = getAssociatedTokenAddressSync(
        mintKeypair.publicKey,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      console.log(associatedToken.toBase58());
      const transaction2 = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedToken,
          wallet.publicKey,
          mintKeypair.publicKey,
          TOKEN_2022_PROGRAM_ID
        )
      );
      const detailTxn = await wallet.sendTransaction(transaction2, connection);
      console.log(`The Txn Signature is ${detailTxn}`);
    } catch (e) {
      console.log("The error is ", e);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-black/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-purple-500/30">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-6 text-center">
          Solana Token Launchpad
        </h1>

        <div className="space-y-5">
          <div className="group">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Token Name
            </label>
            <input
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-white placeholder-gray-400"
              type="text"
              placeholder="Enter token name"
              onInput={(e) => setName(e.target.value)}
            />
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Token Symbol
            </label>
            <input
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-white placeholder-gray-400 uppercase"
              type="text"
              placeholder="Enter symbol (e.g., SOL)"
              onInput={(e) => setSymbol(e.target.value)}
            />
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Image URL
            </label>
            <input
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-white placeholder-gray-400"
              type="text"
              placeholder="Paste image URL"
              onInput={(e) => setImage(e.target.value)}
            />
          </div>

          <div className="group">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Initial Supply
            </label>
            <input
              className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-white placeholder-gray-400"
              type="text"
              placeholder="Enter total supply"
              onInput={(e) => setSupply(e.target.value)}
            />
          </div>

          <button
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
            onClick={create}
          >
            Create Token
          </button>

          <p className="text-xs text-gray-400 text-center mt-4">
            Tokens will be created on Solana Devnet
          </p>
        </div>
      </div>
    </div>
  );
}
