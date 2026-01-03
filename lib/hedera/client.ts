import { Client, PrivateKey, AccountCreateTransaction, Hbar, TokenAssociateTransaction, AccountBalanceQuery, TransferTransaction } from "@hashgraph/sdk";

const HEDERA_NETWORK = process.env.HEDERA_NETWORK || 'testnet';
const OPERATOR_ID = process.env.HEDERA_ACCOUNT_ID;
const OPERATOR_KEY = process.env.HEDERA_PRIVATE_KEY;

export const getClient = () => {
    if (!OPERATOR_ID || !OPERATOR_KEY) {
        throw new Error("HEDERA_OPERATOR_ID and HEDERA_PRIVATE_KEY must be set in .env");
    }

    const client = HEDERA_NETWORK === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
    client.setOperator(OPERATOR_ID, OPERATOR_KEY);
    return client;
};

export async function createUserAccount() {
    const client = getClient();

    // Create new keys
    const newAccountPrivateKey = PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    // Create a new account with 10 Hbar starting balance
    const newAccount = await new AccountCreateTransaction()
        .setKey(newAccountPublicKey)
        .setInitialBalance(new Hbar(10))
        .execute(client);

    // Get the new account ID
    const getReceipt = await newAccount.getReceipt(client);
    const newAccountId = getReceipt.accountId;

    if (!newAccountId) {
        throw new Error("Failed to create new account ID");
    }

    // Associate with LIVEREAL_TOKEN_ID if present
    const tokenId = process.env.LIVEREAL_TOKEN_ID;
    if (tokenId) {
        try {
            const associateRx = await new TokenAssociateTransaction()
                .setAccountId(newAccountId)
                .setTokenIds([tokenId])
                .freezeWith(client)
                .sign(newAccountPrivateKey);

            await associateRx.execute(client);
            console.log(`Associated account ${newAccountId} with token ${tokenId}`);
        } catch (error) {
            console.error(`Failed to associate with token ${tokenId}:`, error);
            // We don't throw here to ensure we still return the created account
        }
    }

    return {
        accountId: newAccountId.toString(),
        privateKey: newAccountPrivateKey.toString(),
        publicKey: newAccountPublicKey.toString()
    };
}

export async function getAccountBalance(accountId: string) {
    const client = getClient();
    const query = new AccountBalanceQuery()
        .setAccountId(accountId);

    const balance = await query.execute(client);

    // Get HBAR balance
    const hbarBalance = balance.hbars.toString();

    // Get Token balance (if LIVEREAL_TOKEN_ID is set)
    let tokenBalance = "0";
    const tokenId = process.env.LIVEREAL_TOKEN_ID;
    if (tokenId) {
        tokenBalance = balance.tokens?.get(tokenId)?.toString() || "0";
    }

    return {
        hbarBalance,
        tokenBalance
    };
}

export async function transferToken(toAccountId: string, amount: number) {
    const client = getClient();
    const tokenId = process.env.LIVEREAL_TOKEN_ID;
    const treasuryId = process.env.HEDERA_ACCOUNT_ID; // Assuming this is treasury
    const treasuryKey = process.env.HEDERA_PRIVATE_KEY;

    if (!tokenId || !treasuryId || !treasuryKey) {
        console.error("Missing Hedera env vars for transfer", { tokenId, treasuryId, hasKey: !!treasuryKey });
        throw new Error("Missing Hedera configuration");
    }

    const transaction = await new TransferTransaction()
        .addTokenTransfer(tokenId, treasuryId, -amount)
        .addTokenTransfer(tokenId, toAccountId, amount)
        .freezeWith(client);

    // Sign with treasury key
    const signTx = await transaction.sign(PrivateKey.fromString(treasuryKey));

    // Execute
    const txResponse = await signTx.execute(client);

    // Get receipt to verify
    const receipt = await txResponse.getReceipt(client);

    return receipt.status.toString();
}

export async function transferTokenFromUser(fromAccountId: string, fromPrivateKey: string, toAccountId: string, amount: number) {
    const client = getClient();
    const tokenId = process.env.LIVEREAL_TOKEN_ID;

    if (!tokenId) {
        throw new Error("Missing LIVEREAL_TOKEN_ID");
    }

    const transaction = await new TransferTransaction()
        .addTokenTransfer(tokenId, fromAccountId, -amount)
        .addTokenTransfer(tokenId, toAccountId, amount)
        .freezeWith(client);

    // Sign with sender key
    const signTx = await transaction.sign(PrivateKey.fromString(fromPrivateKey));

    // Execute
    const txResponse = await signTx.execute(client);

    // Get receipt to verify
    const receipt = await txResponse.getReceipt(client);

    return {
        status: receipt.status.toString(),
        transactionId: txResponse.transactionId.toString(),
    };
}

export async function getTransactionInfo(transactionId: string) {
    // SDK format: 0.0.123@1234567890.123456789
    // Mirror Node format: 0.0.123-1234567890-123456789

    let mirrorNodeId = transactionId;
    if (transactionId.includes('@')) {
        const [account, time] = transactionId.split('@');
        const [seconds, nanos] = time.split('.');
        mirrorNodeId = `${account}-${seconds}-${nanos}`;
    }

    const baseUrl = HEDERA_NETWORK === 'mainnet'
        ? 'https://mainnet-public.mirrornode.hedera.com'
        : 'https://testnet.mirrornode.hedera.com';

    try {
        const response = await fetch(`${baseUrl}/api/v1/transactions/${mirrorNodeId}`);
        if (!response.ok) {
            throw new Error(`Mirror node error: ${response.statusText}`);
        }
        const data = await response.json();

        // The mirror node returns a list of transactions (could be duplicates for child transactions, usually we want the first one or success one)
        const transaction = data.transactions?.find((tx: any) => tx.result === 'SUCCESS') || data.transactions?.[0];

        if (!transaction) {
            return null;
        }

        return transaction;
    } catch (error) {
        console.error("Error fetching transaction from mirror node:", error);
        return null; // Return null instead of throwing to avoid crashing UI
    }
}

