/* Noah Klein */

import React, { useEffect } from 'react';

import { DarkModeSwitch } from 'react-toggle-dark-mode';
import useLocalStorage from 'use-local-storage'

import { Settings } from "./globals";
import "./SettingsBar.css"

interface IdlePlotToggleProps {
    checked: boolean;
    toggleChecked: () => void;
}

const IdlePlotToggle = ({ checked, toggleChecked }: IdlePlotToggleProps) => {
    return (
        <input type="checkbox" className="narrow-checkbox" checked={checked} onChange={() => toggleChecked()} />
    );
}

interface ThemeSwitchProps {
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const ThemeSwitch = ({ setSettings }: ThemeSwitchProps) => {
    const [localIsNightTheme, setLocalIsNightTheme] = useLocalStorage("isNightTheme", false);

    // Sync settings with localStorage theme
    useEffect(() => {
        setSettings(prevSettings => ({
            ...prevSettings,
            isNightTheme: localIsNightTheme,
        }));
        //eslint-disable-next-line
    }, [localIsNightTheme]);

    return (
        <div className='theme-switch'>
            <DarkModeSwitch
                style={{ position: "absolute", top: "21", left: "20", zIndex: "998" }}
                checked={localIsNightTheme}
                onChange={() => { setLocalIsNightTheme(!localIsNightTheme) }}
                size={40}
            />
        </div>
    )

}


interface SettingsBarProps {
    settings: Settings;
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const SettingsBar = ({ settings, setSettings }: SettingsBarProps) => {
    return (
        <div className='SettingsBar'>
            <ThemeSwitch
                setSettings={setSettings}
            />
            <IdlePlotToggle
                checked={settings.displayIdlePlot}
                toggleChecked={() => { setSettings({ ...settings, displayIdlePlot: !settings.displayIdlePlot }) }}
            />
        </div>
    );
};

export default SettingsBar;
