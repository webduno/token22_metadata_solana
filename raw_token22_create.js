import 'dotenv/config'
import { createV1, TokenStandard} from "@metaplex-foundation/mpl-token-metadata";
import { fromWeb3JsPublicKey, fromWeb3JsKeypair} from '@metaplex-foundation/umi-web3js-adapters';
import { loadWalletKey, ourMetadata, SPL_TOKEN_2022_PROGRAM_ID } from './helpers.js';
import * as web3 from "@solana/web3.js";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createSignerFromKeypair, none, percentAmount, signerIdentity } from "@metaplex-foundation/umi";

async function initializeToken() {
    const myKeypair = loadWalletKey(process.env.KEYPAIR_FILE || '');
    const mint = new web3.PublicKey(process.env.TOKEN_ADDRESS || '');
    
    const umi = createUmi(process.env.UMI_RPC_ENDPOINT || '');
  
    const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(myKeypair));
    umi.use(signerIdentity(signer, true));
    
    const onChainData = {...ourMetadata,
      sellerFeeBasisPoints: percentAmount(0,2),creators: none(),
      collection: none(),uses: none(),
    }
    const accounts = {
        mint: fromWeb3JsPublicKey(mint),splTokenProgram: SPL_TOKEN_2022_PROGRAM_ID
    }
    const data = {...onChainData,
        isMutable: true,discriminator: 0,
        tokenStandard: TokenStandard.Fungible,collectionDetails: none(),
        ruleSet: none(),createV1Discriminator: 0,
        primarySaleHappened: true,decimals: none(),
        printSupply: none(),
    }

    try {
        const txid = await createV1(umi, {...accounts, ...data}).sendAndConfirm(umi);
        return txid;
    } catch (error) {
        throw error;
    }
}

initializeToken(); 