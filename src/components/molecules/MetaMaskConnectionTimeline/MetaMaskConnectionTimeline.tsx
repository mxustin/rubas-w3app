// Таймлайн для отображения отдельных фаз подключения к MetaMask [★★★★☆]

import { ClockCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { Timeline, Typography } from 'antd';
import * as React from 'react';

import log from '@/log';
import { formatDateTime } from '@/services/formatDateTime';
import {
    mmConnectionComments,
    type MMConnectionPhase,
    MMConnectionPhases,
    type MMConnectionState,
    MMConnectionStates,
} from '@/services/mmConnectionComments';

import classes from './MetaMaskConnectionTimeline.module.scss';

export interface MetaMaskConnectionTimelineProps {
    onGoOn?: () => void;
    onBreak?: () => void;
    onReset?: () => void;
    phases?: Record<MMConnectionPhase, MMConnectionState>;
    minStageTime?: number;

    onCheckMetaMaskInstalled?: () => Promise<boolean>;
    onCheckMetaMaskUnlocked?: () => Promise<boolean>;
    onCheckMetaMaskNetwork?: () => Promise<boolean>;
    onCheckMetaMaskAccount?: () => Promise<boolean>;
}

export interface MetaMaskConnectionTimelineRef {
    goOn: () => void;
    break: () => void;
    reset: () => void;
    getCurrentPhase: () => MMConnectionPhase;
    isWaiting: () => boolean;
}

export const MetaMaskConnectionTimeline = React.forwardRef<MetaMaskConnectionTimelineRef, MetaMaskConnectionTimelineProps>
    ((props, ref) => {
        const {
            onGoOn,
            onBreak,
            onReset,
            phases: externalPhases,
            minStageTime = 500,
            onCheckMetaMaskInstalled,
            onCheckMetaMaskUnlocked,
            onCheckMetaMaskNetwork,
            onCheckMetaMaskAccount,
        } = props;

    const componentName = 'MetaMaskConnectionTimeline';

    const phaseOrder: MMConnectionPhase[] = [
        MMConnectionPhases.CHECK_IF_INSTALLED,
        MMConnectionPhases.CHECK_IF_UNLOCKED,
        MMConnectionPhases.CHECK_IF_CONNECTED_TO_BSC,
        MMConnectionPhases.CHECK_OUT_ACCOUNT,
    ];

    const initialPhases: Record<MMConnectionPhase, MMConnectionState> = {
        [MMConnectionPhases.CHECK_IF_INSTALLED]: MMConnectionStates.IN_PROGRESS,
        [MMConnectionPhases.CHECK_IF_UNLOCKED]: MMConnectionStates.WAITING,
        [MMConnectionPhases.CHECK_IF_CONNECTED_TO_BSC]: MMConnectionStates.WAITING,
        [MMConnectionPhases.CHECK_OUT_ACCOUNT]: MMConnectionStates.WAITING,
    };

    const [phasesState, setPhasesState] = React.useState<Record<MMConnectionPhase, MMConnectionState>>(
        externalPhases || initialPhases,
    );

    const [phaseTimestamps, setPhaseTimestamps] = React.useState<Record<MMConnectionPhase, string | null>>({
        [MMConnectionPhases.CHECK_IF_INSTALLED]: null,
        [MMConnectionPhases.CHECK_IF_UNLOCKED]: null,
        [MMConnectionPhases.CHECK_IF_CONNECTED_TO_BSC]: null,
        [MMConnectionPhases.CHECK_OUT_ACCOUNT]: null,
    });

    const [isProcessing, setIsProcessing] = React.useState(false);
    const [isFinished, setIsFinished] = React.useState(false);

    const currentPhase = React.useMemo(() => {
        return (
            phaseOrder.find((phase) => phasesState[phase] === MMConnectionStates.IN_PROGRESS) ||
            phaseOrder.find((phase) => phasesState[phase] !== MMConnectionStates.SUCCESS) ||
            MMConnectionPhases.CHECK_IF_INSTALLED
        );
    }, [phasesState]);

    React.useEffect(() => {
        if (externalPhases) {
            setPhasesState(externalPhases);
        }
    }, [externalPhases]);

    const breakProcess = () => {
        if (isProcessing) return;

        log.debug(`${componentName}: прерывание на фазе "${currentPhase}".`);
        setIsProcessing(true);

        setTimeout(() => {
            setPhasesState((prev) => ({
                ...prev,
                [currentPhase]: MMConnectionStates.FAIL,
            }));

            setPhaseTimestamps((prev) => ({
                ...prev,
                [currentPhase]: prev[currentPhase] || formatDateTime(),
            }));

            setIsProcessing(false);
            onBreak?.();
        }, minStageTime);
    };

    const goOn = () => {
        if (isProcessing) return;

        const currentIndex = phaseOrder.indexOf(currentPhase);
        const isLastPhase = currentIndex === phaseOrder.length - 1;
        const nextPhase = isLastPhase ? null : phaseOrder[currentIndex + 1];

        log.debug(`${componentName}: успешное завершение фазы "${currentPhase}".`);
        setIsProcessing(true);

        setTimeout(() => {
            setPhasesState((prev) => {
                const updated: Record<MMConnectionPhase, MMConnectionState> = {
                    ...prev,
                    [currentPhase]: MMConnectionStates.SUCCESS,
                };

                if (nextPhase) {
                    updated[nextPhase] = MMConnectionStates.IN_PROGRESS;
                }

                return updated;
            });

            setPhaseTimestamps((prev) => ({
                ...prev,
                [currentPhase]: prev[currentPhase] || formatDateTime(),
            }));

            setIsProcessing(false);
            onGoOn?.();

            if (isLastPhase) {
                log.debug(`${componentName}: достигнута последняя фаза. Завершаем таймлайн.`);
                setIsFinished(true);
            }
        }, minStageTime);
    };

// Проверка завершения всех фаз
    React.useEffect(() => {
        const allCompleted = phaseOrder.every(
            (phase) =>
                phasesState[phase] === MMConnectionStates.SUCCESS ||
                phasesState[phase] === MMConnectionStates.FAIL,
        );

        if (allCompleted && !isFinished) {
            log.debug(`${componentName}: все фазы завершены. Останавливаем таймлайн.`);
            setIsFinished(true);
        }
    }, [phasesState, isFinished]);

// Автоматическая проверка фаз
    const runPhaseCheck = (
        phase: MMConnectionPhase,
        checker?: () => Promise<boolean>,
    ) => {
        if (isFinished || currentPhase !== phase || !checker) return;

        const run = async () => {
            log.debug(`${componentName}: начало проверки фазы "${phase}".`);
            setIsProcessing(true);

            const start = performance.now();
            const result = await checker();
            const elapsed = performance.now() - start;
            const waitTime = Math.max(minStageTime - elapsed, 0);

            setTimeout(() => {
                result ? goOn() : breakProcess();
            }, waitTime);
        };

        run().catch((err) => {
            log.error(`${componentName}: ошибка при проверке фазы "${phase}":`, err);
            breakProcess();
        });
    };

    React.useEffect(() => {
        runPhaseCheck(MMConnectionPhases.CHECK_IF_INSTALLED, onCheckMetaMaskInstalled);
    }, [currentPhase, onCheckMetaMaskInstalled, isFinished]);

    React.useEffect(() => {
        runPhaseCheck(MMConnectionPhases.CHECK_IF_UNLOCKED, onCheckMetaMaskUnlocked);
    }, [currentPhase, onCheckMetaMaskUnlocked, isFinished]);

    React.useEffect(() => {
        runPhaseCheck(MMConnectionPhases.CHECK_IF_CONNECTED_TO_BSC, onCheckMetaMaskNetwork);
    }, [currentPhase, onCheckMetaMaskNetwork, isFinished]);

    React.useEffect(() => {
        runPhaseCheck(MMConnectionPhases.CHECK_OUT_ACCOUNT, onCheckMetaMaskAccount);
    }, [currentPhase, onCheckMetaMaskAccount, isFinished]);

    const reset = () => {
        log.debug(`${componentName}: сброс состояния.`);
        setPhasesState(initialPhases);
        setPhaseTimestamps({
            [MMConnectionPhases.CHECK_IF_INSTALLED]: null,
            [MMConnectionPhases.CHECK_IF_UNLOCKED]: null,
            [MMConnectionPhases.CHECK_IF_CONNECTED_TO_BSC]: null,
            [MMConnectionPhases.CHECK_OUT_ACCOUNT]: null,
        });
        setIsFinished(false);
        onReset?.();
    };

    const isWaiting = (): boolean => {
        return phaseOrder.some((phase) => phasesState[phase] === MMConnectionStates.IN_PROGRESS);
    };

    React.useImperativeHandle(ref, () => ({
        goOn,
        break: breakProcess,
        reset,
        getCurrentPhase: () => currentPhase,
        isWaiting,
    }));

    const timelineItems = phaseOrder.map((phase) => {
        const state = phasesState[phase];
        const { header, comment } = mmConnectionComments(phase, state, phaseTimestamps[phase]);

        let color: string | undefined;
        let dot: React.ReactNode;

        switch (state) {
            case MMConnectionStates.SUCCESS:
                color = 'green';
                break;
            case MMConnectionStates.FAIL:
                color = 'red';
                break;
            case MMConnectionStates.WAITING:
                color = 'blue';
                dot = (
                    <span className={classes.transparentDot}>
                    <ClockCircleOutlined style={{ fontSize: '16px' }} />
                </span>
                );
                break;
            case MMConnectionStates.IN_PROGRESS:
                dot = (
                    <span className={classes.transparentDot}>
                    <LoadingOutlined style={{ fontSize: '16px' }} spin />
                </span>
                );
                break;
        }

        return {
            color,
            dot,
            children: (
                <div className={classes.timelineItem}>
                    <Typography.Text strong>{header}</Typography.Text>
                    <br />
                    <Typography.Text type="secondary">{comment}</Typography.Text>
                </div>
            ),
        };
    });

    return (
        <div className={classes.container}>
            <Timeline items={timelineItems} />
        </div>
    );
});