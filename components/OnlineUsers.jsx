'use client';

import { usePresenceListener } from '@ably/chat/react';
import styles from './OnlineUsers.module.css';

export default function OnlineUsers() {
  const { presenceData = [] } = usePresenceListener();

  return (
    <aside className={styles.panel}>
      <h3 className={styles.heading}>Online ({presenceData.length})</h3>
      <ul className={styles.list}>
        {presenceData.map((member) => (
          <li key={member.clientId} className={styles.member}>
            <span className={styles.dot} />
            {member.clientId}
          </li>
        ))}
      </ul>
    </aside>
  );
}
