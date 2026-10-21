import React from 'react';
import AlertList from '../components/alerts/AlertList';

export default function AlertsHistory({ alerts }) {
  return (
    <div className="space-y-6">
      <AlertList alerts={alerts} />
    </div>
  );
}
