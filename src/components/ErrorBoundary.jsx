import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-ink p-6 text-white">
          <section className="glass max-w-sm rounded-2xl p-6">
            <h1 className="text-xl font-semibold">SalaryPulse needs a refresh</h1>
            <p className="mt-2 text-sm text-white/70">{this.state.error.message}</p>
            <button className="mt-5 rounded-xl bg-mint px-4 py-3 font-semibold text-ink" onClick={() => location.reload()}>
              Reload app
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
