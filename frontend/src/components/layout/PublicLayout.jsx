import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';

function PublicLayout() {
  return (
    <div>
      <PublicNavbar />
      <Outlet />
    </div>
  );
}

export default PublicLayout;