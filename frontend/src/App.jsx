import { useState } from 'react';
import { AppShell } from './components/layout/AppShell.jsx';
import { HistoryDrawer } from './components/layout/HistoryDrawer.jsx';
import { UploadStep } from './components/flow/UploadStep.jsx';
import { PreviewStep } from './components/flow/PreviewStep.jsx';
import { ProcessingStep } from './components/flow/ProcessingStep.jsx';
import { ResultsStep } from './components/flow/ResultsStep.jsx';
import { ErrorStep } from './components/flow/ErrorStep.jsx';
import { useImportFlow } from './hooks/useImportFlow.js';

export default function App() {
  const { state, upload, confirm, cancel, reset, openHistoricalResult } = useImportFlow();
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <>
      <AppShell step={state.step} onOpenHistory={() => setHistoryOpen(true)}>
        {(state.step === 'idle' || state.step === 'parsing') && (
          <UploadStep onFile={upload} parsing={state.step === 'parsing'} />
        )}

        {state.step === 'preview' && (
          <PreviewStep
            parse={state.parse}
            file={state.file}
            onConfirm={confirm}
            onCancel={reset}
          />
        )}

        {state.step === 'extracting' && (
          <ProcessingStep progress={state.progress} onCancel={cancel} />
        )}

        {state.step === 'done' && <ResultsStep result={state.result} onReset={reset} />}

        {state.step === 'error' && <ErrorStep error={state.error} onReset={reset} />}
      </AppShell>

      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onOpenResult={openHistoricalResult}
      />
    </>
  );
}
