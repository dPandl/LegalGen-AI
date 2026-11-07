// @legalgen-ignore-scan
import React, { useState, useRef } from 'react';
import type { UserProfile } from '../types';
import { CheckCircleIcon } from '../constants';

interface UserProfileEditorProps {
    profile: UserProfile;
    onSave: (updated: UserProfile) => void;
}

const splitFullName = (fullName: string): { firstName: string; lastName: string } => {
    const trimmed = (fullName || '').trim();
    if (!trimmed) return { firstName: '', lastName: '' };
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) return { firstName: parts[0], lastName: '' };
    return {
        firstName: parts.slice(0, -1).join(' '),
        lastName: parts[parts.length - 1]
    };
};

export const UserProfileEditor: React.FC<UserProfileEditorProps> = ({ profile, onSave }) => {
    const [entityType, setEntityType] = useState<'private' | 'company'>(profile.entityType || 'private');
    const [initialValues, setInitialValues] = useState<UserProfile>({ ...profile });
    const [showSuccess, setShowSuccess] = useState(false);
    const [formResetKey, setFormResetKey] = useState(0);
    const formRef = useRef<HTMLFormElement>(null);

    const readProfileFromDom = (): UserProfile => {
        const form = formRef.current;
        if (!form) return { ...initialValues, entityType };

        const getVal = (name: string) => {
            const el = form.elements.namedItem(name) as HTMLInputElement | null;
            return el ? el.value.trim() : '';
        };

        const firstName = getVal('firstName');
        const lastName = getVal('lastName');
        const fullName = [firstName, lastName].filter(Boolean).join(' ');

        return {
            name: fullName,
            email: getVal('email'),
            phone: getVal('phone'),
            street: getVal('address'),
            zipCode: getVal('zip'),
            city: getVal('city'),
            companyName: getVal('company'),
            legalForm: getVal('legalForm'),
            representative: getVal('companyRepresentative'),
            ustId: getVal('vatNumber') || getVal('ustId'),
            entityType
        };
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updated = readProfileFromDom();
        setInitialValues(updated);
        onSave(updated);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const handleClearFields = () => {
        const emptyProfile: UserProfile = {
            name: '',
            street: '',
            zipCode: '',
            city: '',
            email: '',
            phone: '',
            companyName: '',
            legalForm: '',
            representative: '',
            ustId: '',
            entityType
        };
        setInitialValues(emptyProfile);
        onSave(emptyProfile);
        setFormResetKey(prev => prev + 1);
    };

    const { firstName, lastName } = splitFullName(initialValues.name);

    return (
        <div className="w-full">
            <div className="app-roster-toolbar flex items-center justify-between gap-3">
                <h1 className="app-page-title">Mein Profil</h1>
            </div>

            {showSuccess && (
                <div className="app-toast">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                    <span>Profil erfolgreich gespeichert</span>
                </div>
            )}

            <form
                ref={formRef}
                key={formResetKey}
                autoComplete="on"
                onSubmit={handleSubmit}
                className="hub-card space-y-5 w-full"
            >
                <div className="pb-5 border-b border-slate-100 space-y-3">
                    <div>
                        <h2 className="settings-section-title">Rechtlicher Status & Organisationsform</h2>
                        <p className="settings-section-desc mb-0">
                            Diese Stammdaten werden lokal auf Ihrem Gerät gespeichert und automatisch für Ihre generierten Rechtstexte herangezogen.
                        </p>
                    </div>

                    <div className="app-seg grid grid-cols-2 p-1 rounded-full w-full">
                        <button
                            type="button"
                            onClick={() => setEntityType('private')}
                            className={`py-2 px-4 rounded-full text-xs font-bold transition-colors ${
                                entityType === 'private'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Privatperson / Einzelunternehmer
                        </button>
                        <button
                            type="button"
                            onClick={() => setEntityType('company')}
                            className={`py-2 px-4 rounded-full text-xs font-bold transition-colors ${
                                entityType === 'company'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Unternehmen (z.B. GmbH, UG, GbR, AG)
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h2 className="settings-section-title">Persönliche Angaben & Anschrift</h2>
                        <p className="settings-section-desc">
                            Kontaktinformationen und ladungsfähige Anschrift (§ 5 DDG & Art. 13 DSGVO).
                        </p>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="modal-label">Vorname</label>
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        autoComplete="given-name"
                                        data-form-type="name,first"
                                        defaultValue={firstName}
                                        className="modal-input"
                                        placeholder="z.B. Max"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="modal-label">Nachname</label>
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        autoComplete="family-name"
                                        data-form-type="name,last"
                                        defaultValue={lastName}
                                        className="modal-input"
                                        placeholder="z.B. Mustermann"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="email" className="modal-label">E-Mail-Adresse</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        data-form-type="email"
                                        defaultValue={initialValues.email || ''}
                                        className="modal-input"
                                        placeholder="z.B. mail@domain.de"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="modal-label">Telefonnummer</label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        autoComplete="tel"
                                        data-form-type="phone"
                                        defaultValue={initialValues.phone || ''}
                                        className="modal-input"
                                        placeholder="z.B. +49 123 456789"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                                <div className="sm:col-span-5">
                                    <label htmlFor="address" className="modal-label">Straße & Hausnr.</label>
                                    <input
                                        id="address"
                                        name="address"
                                        type="text"
                                        autoComplete="street-address"
                                        data-form-type="address"
                                        defaultValue={initialValues.street || ''}
                                        className="modal-input"
                                        placeholder="Musterstraße 42"
                                    />
                                </div>
                                <div className="sm:col-span-3">
                                    <label htmlFor="zip" className="modal-label">PLZ</label>
                                    <input
                                        id="zip"
                                        name="zip"
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="postal-code"
                                        data-form-type="zip"
                                        defaultValue={initialValues.zipCode || ''}
                                        className="modal-input"
                                        placeholder="12345"
                                    />
                                </div>
                                <div className="sm:col-span-4">
                                    <label htmlFor="city" className="modal-label">Ort</label>
                                    <input
                                        id="city"
                                        name="city"
                                        type="text"
                                        autoComplete="address-level2"
                                        data-form-type="city"
                                        defaultValue={initialValues.city || ''}
                                        className="modal-input"
                                        placeholder="Musterstadt"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="settings-section-title">Unternehmen & Rechtliches (optional)</h2>
                        <p className="settings-section-desc">
                            Angaben zu Firma, Rechtsform, Vertretung und Umsatzsteuer-ID.
                        </p>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="company" className="modal-label">Firmenname</label>
                                    <input
                                        id="company"
                                        name="company"
                                        type="text"
                                        autoComplete="organization"
                                        data-form-type="company"
                                        defaultValue={initialValues.companyName || ''}
                                        className="modal-input"
                                        placeholder="Muster GmbH"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="legalForm" className="modal-label">Rechtsform</label>
                                    <input
                                        id="legalForm"
                                        name="legalForm"
                                        type="text"
                                        autoComplete="off"
                                        data-dashlane-ignore="true"
                                        data-form-type="other"
                                        defaultValue={initialValues.legalForm || ''}
                                        className="modal-input"
                                        placeholder="z.B. GmbH, UG, GbR"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="companyRepresentative" className="modal-label">Vertretungsberechtigte Person</label>
                                <input
                                    id="companyRepresentative"
                                    name="companyRepresentative"
                                    type="text"
                                    autoComplete="off"
                                    data-dashlane-ignore="true"
                                    data-form-type="other"
                                    defaultValue={initialValues.representative || ''}
                                    className="modal-input"
                                    placeholder="z.B. Max Mustermann (Geschäftsführer)"
                                />
                            </div>

                            <div>
                                <label htmlFor="vatNumber" className="modal-label">Umsatzsteuer-Identifikationsnummer (§ 27a UStG)</label>
                                <input
                                    id="vatNumber"
                                    name="vatNumber"
                                    type="text"
                                    autoComplete="off"
                                    readOnly
                                    onFocus={(e) => { e.currentTarget.readOnly = false; }}
                                    spellCheck={false}
                                    data-dashlane-ignore="true"
                                    data-form-type="other"
                                    data-lpignore="true"
                                    data-1p-ignore="true"
                                    data-bwignore="true"
                                    defaultValue={initialValues.ustId || ''}
                                    className="modal-input"
                                    placeholder="z.B. DE 123456789"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center gap-3">
                    <button
                        type="button"
                        onClick={handleClearFields}
                        className="modal-btn-secondary text-xs"
                    >
                        Felder leeren
                    </button>
                    <button
                        type="submit"
                        className="modal-btn-primary"
                    >
                        Änderungen speichern
                    </button>
                </div>
            </form>
        </div>
    );
};
