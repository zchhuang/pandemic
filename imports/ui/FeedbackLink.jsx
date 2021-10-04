import React from 'react';
import PropTypes from 'prop-types';

/**
 *
 * For linking to our Google form feedback.
 *
 * Usage:
 *   <FeedbackLink>
 *     ...text, images, other components...
 *   </FeedbackLink>
 *
 */
function FeedbackLink({ children }) {
  return (
    <a
      href="https://forms.gle/hafHG9NGTZaHFF9X6"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

FeedbackLink.propTypes = {
  children: PropTypes.any,
};

export default FeedbackLink;
