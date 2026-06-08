import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader.jsx';
import { Panel } from '../components/Panel.jsx';

export default function NotFound() {
  return (
    <>
      <PageHeader kicker="404" title="Page not found" />
      <Panel>
        <Link className="rounded-2xl bg-mint px-5 py-3 font-bold text-ink" to="/">Go home</Link>
      </Panel>
    </>
  );
}
