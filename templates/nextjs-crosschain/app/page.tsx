"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

function shorten(value?: string) {
  if (!value) {
    return "Not connected";
  }

  if (value.length <= 16) {
    return value;
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function StatusPill({ active, label }: { active: boolean; label: string }) {
  return <span className={active ? "status-pill status-pill-active" : "status-pill"}>{label}</span>;
}

export default function Home() {
  const { address, chain, isConnected } = useAccount();
  const { connectors, connect, error, isPending } = useConnect();
  const { disconnect: disconnectEvm } = useDisconnect();
  const { publicKey, connected: solanaConnected, wallet, disconnect: disconnectSolana } = useWallet();
  const [sessionNote, setSessionNote] = useState("Waiting for both wallets.");

  const injectedConnector = connectors.find((connector) => connector.type === "injected") ?? connectors[0];
  const solanaAddress = publicKey?.toBase58();
  const bothConnected = isConnected && solanaConnected;

  const sessionSummary = useMemo(
    () => ({
      evmAddress: address ?? null,
      evmNetwork: chain?.name ?? null,
      solanaPublicKey: solanaAddress ?? null,
      solanaNetwork: "devnet",
      ready: bothConnected,
    }),
    [address, bothConnected, chain?.name, solanaAddress],
  );

  const buildSession = () => {
    if (!bothConnected) {
      setSessionNote("Connect one EVM wallet and one Solana wallet before creating a unified identity view.");
      return;
    }

    setSessionNote(
      `Cross-chain identity ready: ${shorten(address)} on ${chain?.name ?? "EVM"} paired with ${shorten(solanaAddress)} on Solana devnet.`,
    );
  };

  return (
    <main className="shell">
      <section className="intro">
        <div>
          <p className="eyebrow">Cross-chain dApp starter</p>
          <h1>Connect EVM and Solana wallets in one Next.js app.</h1>
        </div>
        <div className="network-strip" aria-label="Supported networks">
          <span>Ethereum</span>
          <span>Sepolia</span>
          <span>Solana devnet</span>
        </div>
      </section>

      <section className="dashboard" aria-label="Cross-chain wallet dashboard">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">EVM wallet</p>
              <h2>{shorten(address)}</h2>
            </div>
            <StatusPill active={isConnected} label={isConnected ? "Connected" : "Offline"} />
          </div>

          <dl className="facts">
            <div>
              <dt>Network</dt>
              <dd>{chain?.name ?? "Choose after connecting"}</dd>
            </div>
            <div>
              <dt>Connector</dt>
              <dd>{injectedConnector?.name ?? "No injected wallet found"}</dd>
            </div>
          </dl>

          {isConnected ? (
            <button className="button secondary" type="button" onClick={() => disconnectEvm()}>
              Disconnect EVM
            </button>
          ) : (
            <button
              className="button"
              type="button"
              disabled={!injectedConnector || isPending}
              onClick={() => injectedConnector && connect({ connector: injectedConnector })}
            >
              {isPending ? "Opening wallet..." : "Connect EVM"}
            </button>
          )}

          {error ? <p className="error">{error.message}</p> : null}
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Solana wallet</p>
              <h2>{shorten(solanaAddress)}</h2>
            </div>
            <StatusPill active={solanaConnected} label={solanaConnected ? "Connected" : "Offline"} />
          </div>

          <dl className="facts">
            <div>
              <dt>Network</dt>
              <dd>Solana devnet</dd>
            </div>
            <div>
              <dt>Adapter</dt>
              <dd>{wallet?.adapter.name ?? "Select in wallet modal"}</dd>
            </div>
          </dl>

          <div className="wallet-row">
            <WalletMultiButton />
            {solanaConnected ? (
              <button className="button secondary" type="button" onClick={() => disconnectSolana()}>
                Disconnect
              </button>
            ) : null}
          </div>
        </article>

        <article className="panel session-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Unified session</p>
              <h2>{bothConnected ? "Identity pair ready" : "Connect both sides"}</h2>
            </div>
            <StatusPill active={bothConnected} label={bothConnected ? "Ready" : "Incomplete"} />
          </div>

          <pre className="session-code">{JSON.stringify(sessionSummary, null, 2)}</pre>

          <button className="button" type="button" onClick={buildSession}>
            Build identity view
          </button>
          <p className="session-note">{sessionNote}</p>
        </article>

        <article className="panel next-actions">
          <p className="panel-kicker">Example flow</p>
          <h2>Safe first cross-chain interaction</h2>
          <ol>
            <li>Connect an EVM wallet through wagmi.</li>
            <li>Connect a Solana wallet through wallet-adapter.</li>
            <li>Show both identities in one client session.</li>
          </ol>
          <p>
            This starter stops before token movement. Add message signing, proof storage, or a bridge SDK only after
            deciding the protocol and trust model.
          </p>
        </article>
      </section>
    </main>
  );
}
