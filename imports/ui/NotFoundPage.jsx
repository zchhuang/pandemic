import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';

import './StatusPage.css';

export default function NotFoundPage() {
  return (
    <div className="status-not-found status-background">
      <div className="status-options">
        <div className="status-content">
          404: Page Not Found
          <p className="status-description-text">
            This page is currently quarantining 🤒
          </p>
          <div className="status-space" />
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button
              className="status-buttons"
              variant="outlined"
              vardisableUnderline={true}
            >
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
