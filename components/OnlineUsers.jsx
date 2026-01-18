'use client';

import { usePresenceListener } from '@ably/chat/react';
import styles from './OnlineUsers.module.css';

export default function OnlineUsers() {
  const { presenceData = [] } = usePresenceListener();

  return (
    <aside className={styles.panel} data-testid="online-users">
      <h3 className={styles.heading}>
        Online (<span data-testid="online-users-count">{presenceData.length}</span>)
      </h3>
      <ul className={styles.list}>
        {presenceData.map((member) => (
          <li key={member.clientId} className={styles.member} data-testid="online-user-item">
            <span className={styles.dot} />
            {member.clientId}
          </li>
        ))}
      </ul>
    </aside>
  );
}
