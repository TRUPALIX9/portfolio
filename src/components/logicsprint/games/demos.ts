import type { ComponentType } from 'react';
import type { GameType } from '@/data/logicsprint';
import AngleSenseDemo from './AngleSenseDemo';
import GuessColorDemo from './GuessColorDemo';
import LineSplitDemo from './LineSplitDemo';
import MemoryLaneDemo from './MemoryLaneDemo';
import QuickMathDemo from './QuickMathDemo';
import RocketLaunchDemo from './RocketLaunchDemo';

/** One scripted gameplay recording per game; each renders the app screen that goes in a PhoneFrame. */
export const DEMOS: Record<GameType, ComponentType> = {
    rocketLaunch: RocketLaunchDemo,
    memoryLane: MemoryLaneDemo,
    quickMath: QuickMathDemo,
    guessColor: GuessColorDemo,
    angleSense: AngleSenseDemo,
    lineSplit: LineSplitDemo,
};

export const SHORT_NAME: Record<GameType, string> = {
    rocketLaunch: 'Rocket',
    memoryLane: 'Memory',
    quickMath: 'Math',
    guessColor: 'Color',
    angleSense: 'Angle',
    lineSplit: 'Line',
};
