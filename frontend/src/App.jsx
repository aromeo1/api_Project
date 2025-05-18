import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Navigation from './components/Navigation';
import * as sessionActions from './store/session';
import LoginFormPage from './components/LoginFormPage/LoginFormPage';
import SpotsFeed from './components/SpotsFeed/SpotsFeed';
import SpotDetails from './components/SpotDetails/SpotDetails';
import CreateSpotPage from './components/CreateSpotPage/CreateSpotPage';
import ManageSpots from './components/ManageSpots/ManageSpots';
import UpdateSpotForm from './components/UpdateSpotForm/UpdateSpotForm';
import { ModalProvider, Modal } from './components/context/Modal';

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true)
    });
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Outlet />}
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <SpotsFeed />
      },
      {
        path: '/login',
        element: <LoginFormPage />
      },
      {
        path: '/spots/:spotId',
        element: <SpotDetails />
      },
      {
        path: '/spots/new',
        element: <CreateSpotPage />
      },
      {
        path: '/manage-spots',
        element: <ManageSpots />
      },
      {
        path: '/spots/:spotId/edit',
        element: <UpdateSpotForm />
      }
    ]
  }
]);

function App() {
  return (
    <ModalProvider>
      <RouterProvider router={router} />
      <Modal />
    </ModalProvider>
  );
}

export default App;
