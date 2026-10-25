import { useEffect, useState } from 'react';
import ArchitectureDemo from '../features/architecture/ArchitectureDemo';
import FlowDemo from '../features/data-flow/FlowDemo';

export default function App() {
  const [flow, setFlow] = useState(() => location.hash === '#flows');
  useEffect(() => {
    const listener = () => setFlow(location.hash === '#flows');
    addEventListener('hashchange', listener);
    return () => removeEventListener('hashchange', listener);
  }, []);
  function choose(v: boolean) {
    history.replaceState(null, '', v ? '#flows' : '#architecture');
    setFlow(v);
  }
  return (
    <>
      <nav className="experience-nav" aria-label="Presentation view">
        <button aria-pressed={!flow} onClick={() => choose(false)}>
          Architecture
        </button>
        <button aria-pressed={flow} onClick={() => choose(true)}>
          Data flow
        </button>
      </nav>
      {flow ? <FlowDemo /> : <ArchitectureDemo />}
    </>
  );
}
