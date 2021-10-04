import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import '../StatusPage.css';
import Button from '@material-ui/core/Button';
import FeedbackLink from '../FeedbackLink';

function VictoryPage({ players }) {
  return (
    <>
      <div className="status-victory status-background">
        <div className="status-options">
          <div className="status-content">
            Congrats, the {players.length} of you eradicated the viruses and
            saved the world!
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
          <div className="status-feedback">
            See a bug or have a suggestion?{' '}
            <FeedbackLink> Give us some feedback!</FeedbackLink>
          </div>
        </div>
      </div>
    </>
  );
}

VictoryPage.propTypes = {
  game: PropTypes.object,
  players: PropTypes.array,
};

const mapStateToProps = (state) => {
  return {
    game: state.meteorData.gameObject,
    players: state.meteorData.players,
  };
};

export default connect(mapStateToProps)(VictoryPage);
