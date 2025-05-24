// Хранилище временных меток фаз подключения MetaMask [★★★★☆]

import { create } from 'zustand';

import {
    type ConnectionPhase,
    ConnectionPhases,
    type PhaseStatus,
    PhaseStatuses,
} from '@/constants/connectionPhases';
import log from '@/log';


type Timestamp = string | null;

export type PhaseTimeline = Record<ConnectionPhase, Record<PhaseStatus, Timestamp>>;

interface PhaseTimelineStore {
    timeline: PhaseTimeline;

    /**
     Устанавливает временную метку для определенной фазы и статуса
     */

    setTimestamp: (phase: ConnectionPhase, status: PhaseStatus, timestamp?: string | null) => void;

    /**
     Сброс всех временных меток (начальная инициализация)
     */

    resetTimeline: () => void;
}

const createInitialTimeline = (): PhaseTimeline => {
    const initial: PhaseTimeline = {} as PhaseTimeline;

    Object.values(ConnectionPhases).forEach((phase) => {
        initial[phase] = {
            [PhaseStatuses.WAITING]: null,
            [PhaseStatuses.IN_PROGRESS]: null,
            [PhaseStatuses.SUCCESS]: null,
            [PhaseStatuses.FAIL]: null,
            [PhaseStatuses.CANCELLED]: null,
        };
    });

    return initial;
};

export const usePhaseTimelineStore = create<PhaseTimelineStore>((set) => ({
    timeline: createInitialTimeline(),

    setTimestamp: (phase, status, timestamp = new Date().toISOString()) => {
        log.debug(`[PhaseTimeline] Установка timestamp: phase="${phase}", status="${status}", time="${timestamp}"`);
        set((state) => ({
            timeline: {
                ...state.timeline,
                [phase]: {
                    ...state.timeline[phase],
                    [status]: timestamp,
                },
            },
        }));
    },

    resetTimeline: () => {
        log.debug('[PhaseTimeline] Сброс всех временных меток');
        set(() => ({
            timeline: createInitialTimeline(),
        }));
    },
}));