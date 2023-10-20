import { Spinner } from 'react-bootstrap';
import React from 'react';
import { useThemeContext } from '../context/ThemeContext';

export function Loading() {
const {contextTheme} = useThemeContext();

    return (
        <>
            <div className={`${contextTheme} loadingFlex`}>
                <div className="logoContainer">
                    <div className="logoImage"></div>
                </div>
                <h4 className="center">Loading<Spinner animation="border" /></h4>
            </div>
        </>
    );
} 