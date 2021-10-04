import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import '../StatusPage.css';
import Button from '@material-ui/core/Button';
import FeedbackLink from '../FeedbackLink';

function DefeatPage({ players }) {
  return (
    <>
      <div className="status-defeat status-background">
        <div className="status-options">
          <div className="status-content">
            Rip. The {players.length} of you fought valiantly, but alas you were
            unable to save humanity.
            <div className="status-space" />
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Button className="status-buttons" variant="outlined">
                Home
              </Button>
            </Link>
          </div>
          <div className="status-feedback">
            See a bug or have a suggestion?{' '}
            <FeedbackLink> Give us some feedback!</FeedbackLink>
          </div>
        </div>
      </div>
    </>
  );
}

DefeatPage.propTypes = {
  game: PropTypes.object,
  players: PropTypes.array,
};

const mapStateToProps = (state) => {
  return {
    game: state.meteorData.gameObject,
    players: state.meteorData.players,
  };
};

export default connect(mapStateToProps)(DefeatPage);
