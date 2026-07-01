import React from 'react';
import zxcvbn from 'zxcvbn';
import { ProgressBar } from 'react-bootstrap';

const PasswordStrengthMeter = ({ password }) => {
    const testResult = zxcvbn(password);
    const score = testResult.score * 100 / 4; // Converte a pontuação (0-4) para uma percentagem

    const getVariant = () => {
        switch (testResult.score) {
            case 0: return 'danger';
            case 1: return 'danger';
            case 2: return 'warning';
            case 3: return 'info';
            case 4: return 'success';
            default: return 'danger';
        }
    };

    const createPasswordLabel = () => {
        switch (testResult.score) {
            case 0: return 'Muito Fraca';
            case 1: return 'Fraca';
            case 2: return 'Razoável';
            case 3: return 'Boa';
            case 4: return 'Forte';
            default: return '';
        }
    };

    // Lista de critérios para feedback ao utilizador
    const checks = [
        { label: 'Pelo menos 8 caracteres', fulfilled: password.length >= 8 },
        { label: 'Uma letra maiúscula', fulfilled: /[A-Z]/.test(password) },
        { label: 'Uma letra minúscula', fulfilled: /[a-z]/.test(password) },
        { label: 'Um número', fulfilled: /[0-9]/.test(password) },
        { label: 'Um caractere especial', fulfilled: /[^A-Za-z0-9]/.test(password) },
    ];

    return (
        <div className="mt-2">
            <ProgressBar now={score} variant={getVariant()} />
            <p className="small text-end mt-1 fw-bold">{createPasswordLabel()}</p>

            <div className="mt-2">
                {checks.map((check, index) => (
                    <div key={index} className={`small d-flex align-items-center ${check.fulfilled ? 'text-success' : 'text-muted'}`}>
                        <i className={`bi ${check.fulfilled ? 'bi-check-circle-fill' : 'bi-x-circle'} me-2`}></i>
                        {check.label}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PasswordStrengthMeter;