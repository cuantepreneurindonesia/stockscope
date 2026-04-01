import HypercareClient from './HypercareClient';

export const metadata = {
  title: 'Hypercare Dashboard | Stockscope',
  description: 'Paywall monitoring and rollback triggers',
};

export default function HypercarePage() {
  return <HypercareClient />;
}
