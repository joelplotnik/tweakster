import React from 'react';
import { Outlet } from 'react-router-dom';

function ConversationsLayout() {
  return (
    <>
      <Outlet />
    </>
  );
}

export default ConversationsLayout;
