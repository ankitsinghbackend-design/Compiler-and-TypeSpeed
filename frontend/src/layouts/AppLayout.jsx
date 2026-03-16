import SupportModal from '../components/SupportModal.jsx';
import { useNetCheck } from '../hooks/useNetCheck.jsx';

export default function AppLayout({ children }) {
  const { detected, loading, retry } = useNetCheck({
    baitPath: '/ads-bait-a9f3d1.js',
    prebidPath: '/ads-prebid-a9f3d1.js',
    location: 'main-app'
  });

  return (
    <>
      {children}
      <SupportModal open={detected} loading={loading} onRetry={() => { retry() }} />
    </>
  );
}
