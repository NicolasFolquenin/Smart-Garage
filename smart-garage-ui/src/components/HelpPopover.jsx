import { OverlayTrigger, Popover, Button } from 'react-bootstrap';
import { FaQuestionCircle } from 'react-icons/fa';
import React, { forwardRef } from 'react';

/**
 * @param {object} props
 * @param {string} props.title
 * @param {React.ReactNode} props.content -
 * @param {string} props.id 
 */
const HelpPopover = ({ title, content, id }) => {

    const popover = (
        <Popover id={`popover-help-${title.replace(/\s+/g, '')}`}>
            <Popover.Header as="h3">{title}</Popover.Header>
            <Popover.Body>{content}</Popover.Body>
        </Popover>
    );

    return (
        // OverlayTrigger -> componente do React Bootstrap que controla a exibição.
        <OverlayTrigger trigger="click" rootClose placement="auto" overlay={popover}>
            <span
                id={id}
                className="ms-2 text-primary"
                style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                aria-label="Ajuda"
            >
                <FaQuestionCircle />
            </span>
        </OverlayTrigger>
    );
};

export default HelpPopover;