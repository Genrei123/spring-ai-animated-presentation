import { useEffect, useState } from 'react';
import ArchitectureDemo from '../features/architecture/ArchitectureDemo';
import FlowDemo from '../features/data-flow/FlowDemo';
import ComponentBuilder from '../features/component-builder/ComponentBuilder';

type View = 'architecture' | 'flows' | 'builder';
const currentView = (): View =>
  location.hash === '#builder' ? 'builder' : location.hash === '#flows' ? 'flows' : 'architecture';

export default function App() {
  const [view, setView] = useState<View>(currentView);
  useEffect(() => {
    const listener = () => setView(currentView());
    addEventListener('hashchange', listener);
    return () => removeEventListener('hashchange', listener);
  }, []);
  function choose(v: View) {
    history.replaceState(null, '', `#${v}`);
    setView(v);
  }
  return (
    <>
      <nav className="experience-nav" aria-label="Presentation view">
        <button aria-pressed={view === 'architecture'} onClick={() => choose('architecture')}>
          Architecture
        </button>
        <button aria-pressed={view === 'flows'} onClick={() => choose('flows')}>
          Data flow
        </button>
        <button aria-pressed={view === 'builder'} onClick={() => choose('builder')}>
          Component builder
        </button>
      </nav>
      {view === 'builder' ? (
        <ComponentBuilder />
      ) : view === 'flows' ? (
        <FlowDemo />
      ) : (
        <ArchitectureDemo />
      )}
    </>
  );
}
