// Таймлайн для отображения отдельных фаз подключения к MetaMask-у

// Импорт необходимых библиотек и компонентов
import { ClockCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { Timeline, Typography } from 'antd';
import React, { useEffect, useImperativeHandle, useState } from 'react';

// Импорт вспомогательных модулей
import log from '@/log';
import { formatDateTime } from '@/services/formatDateTime';
import {
    mmConnectionComments,
    type MMConnectionPhase,
    MMConnectionPhases,
    type MMConnectionState,
    MMConnectionStates
} from '@/services/mmConnectionComments';

// Импорт стилей
import classes from './MetaMaskConnectionTimeline.module.scss';

// Интерфейс для пропсов компонента
export interface MetaMaskConnectionTimelineProps {
    /**
     * Обработчик успешного перехода на следующую стадию
     */
    onGoOn?: () => void;

    /**
     * Обработчик прерывания процесса
     */
    onBreak?: () => void;

    /**
     * Обработчик сброса состояния
     */
    onReset?: () => void;

    /**
     * Внешнее управление состояниями фаз
     */
    phases?: Record<MMConnectionPhase, MMConnectionState>;

    /**
     * Минимальное время отображения стадии (в миллисекундах)
     */
    minStageTime?: number;
}

// Интерфейс для методов, доступных через ref
export interface MetaMaskConnectionTimelineRef {
    /**
     * Переход к следующей стадии
     */
    goOn: () => void;

    /**
     * Прерывание текущей стадии
     */
    break: () => void;

    /**
     * Полный сброс состояния
     */
    reset: () => void;

    /**
     * Получение текущей активной фазы
     */
    getCurrentPhase: () => MMConnectionPhase;

    /**
     * Проверка состояния ожидания
     */
    isWaiting: () => boolean;
}

/**
 * Основной компонент Timeline для отображения процесса подключения к MetaMask
 */
export const MetaMaskConnectionTimeline =
    React.forwardRef<MetaMaskConnectionTimelineRef, MetaMaskConnectionTimelineProps>(
        (props, ref) => {
            // Деструктуризация пропсов
            const {
                onGoOn,
                onBreak,
                onReset,
                phases: externalPhases,
                minStageTime = 250
            } = props;

            // Имя компонента для логирования
            const componentName = 'MetaMaskConnectionTimeline';

            // Порядок следования фаз
            const phaseOrder = [
                MMConnectionPhases.CHECK_IF_INSTALLED,
                MMConnectionPhases.CHECK_IF_UNLOCKED,
                MMConnectionPhases.CHECK_IF_CONNECTED_TO_BSC,
                MMConnectionPhases.CHECK_OUT_ACCOUNT,
            ];

            // Начальное состояние всех фаз
            const initialPhases = {
                [MMConnectionPhases.CHECK_IF_INSTALLED]: MMConnectionStates.IN_PROGRESS,
                [MMConnectionPhases.CHECK_IF_UNLOCKED]: MMConnectionStates.WAITING,
                [MMConnectionPhases.CHECK_IF_CONNECTED_TO_BSC]: MMConnectionStates.WAITING,
                [MMConnectionPhases.CHECK_OUT_ACCOUNT]: MMConnectionStates.WAITING,
            };

            // Хук состояния для хранения временных меток завершения фаз
            const [phaseTimestamps, setPhaseTimestamps] = useState<
                Record<MMConnectionPhase, string | null>
            >({
                [MMConnectionPhases.CHECK_IF_INSTALLED]: null,
                [MMConnectionPhases.CHECK_IF_UNLOCKED]: null,
                [MMConnectionPhases.CHECK_IF_CONNECTED_TO_BSC]: null,
                [MMConnectionPhases.CHECK_OUT_ACCOUNT]: null,
            });

            // Хук состояния для управления процессом выполнения
            const [isProcessing, setIsProcessing] = useState(false);

            // Основное состояние компонента
            const [phasesState, setPhasesState] = useState<Record<MMConnectionPhase, MMConnectionState>>(
                externalPhases || initialPhases
            );

            // Определение текущей активной фазы
            const currentPhase = (() => {
                // Поиск фазы в состоянии "в процессе"
                const inProgressPhase = phaseOrder.find(
                    phase => phasesState[phase] === MMConnectionStates.IN_PROGRESS
                );

                // Возвращаем найденную фазу или первую не завершенную
                return inProgressPhase
                    || phaseOrder.find(phase => phasesState[phase] !== MMConnectionStates.SUCCESS)
                    || phaseOrder[0];
            })();

            // Эффект для синхронизации с внешним состоянием
            useEffect(() => {
                if (externalPhases) {
                    setPhasesState(externalPhases);
                }
            }, [externalPhases]);

            // Обработчик успешного завершения фазы
            const goOn = () => {
                if (isProcessing) return;

                // Определение индекса текущей фазы
                const currentIndex = phaseOrder.indexOf(currentPhase);

                // Определение следующей фазы
                const nextPhase = currentIndex < phaseOrder.length - 1
                    ? phaseOrder[currentIndex + 1]
                    : null;

                // Логирование события
                log.debug(`${componentName}: выполнено успешное завершение фазы "${currentPhase}".`);

                // Установка состояния обработки
                setIsProcessing(true);

                // Имитация задержки выполнения
                setTimeout(() => {
                    // Обновление состояния фаз
                    setPhasesState(prev => ({
                        ...prev,
                        [currentPhase]: MMConnectionStates.SUCCESS,
                        ...(nextPhase ? { [nextPhase]: MMConnectionStates.IN_PROGRESS } : {}),
                    }));

                    // Обновление временных меток
                    setPhaseTimestamps(prev => ({
                        ...prev,
                        [currentPhase]: prev[currentPhase] || formatDateTime(),
                    }));

                    // Сброс состояния обработки
                    setIsProcessing(false);

                    // Вызов внешнего обработчика
                    onGoOn?.();
                }, minStageTime);
            };

            // Обработчик прерывания фазы
            const breakProcess = () => {
                if (isProcessing) return;

                // Логирование события
                log.debug(`${componentName}: выполнено прерывание процесса на фазе "${currentPhase}".`);

                // Установка состояния обработки
                setIsProcessing(true);

                // Имитация задержки выполнения
                setTimeout(() => {
                    // Обновление состояния фаз
                    setPhasesState(prev => ({
                        ...prev,
                        [currentPhase]: MMConnectionStates.FAIL,
                    }));

                    // Обновление временных меток
                    setPhaseTimestamps(prev => ({
                        ...prev,
                        [currentPhase]: prev[currentPhase] || formatDateTime(),
                    }));

                    // Сброс состояния обработки
                    setIsProcessing(false);

                    // Вызов внешнего обработчика
                    onBreak?.();
                }, minStageTime);
            };

            // Обработчик сброса состояния
            const reset = () => {
                // Логирование события
                log.debug(`${componentName}: выполнен сброс состояния.`);

                // Сброс состояний к начальным значениям
                setPhasesState(initialPhases);
                setPhaseTimestamps({
                    [MMConnectionPhases.CHECK_IF_INSTALLED]: null,
                    [MMConnectionPhases.CHECK_IF_UNLOCKED]: null,
                    [MMConnectionPhases.CHECK_IF_CONNECTED_TO_BSC]: null,
                    [MMConnectionPhases.CHECK_OUT_ACCOUNT]: null,
                });

                // Вызов внешнего обработчика
                onReset?.();
            };

            // Проверка состояния ожидания
            const isWaiting = (): boolean => {
                return phaseOrder.some(
                    phase => phasesState[phase] === MMConnectionStates.IN_PROGRESS
                );
            };

            // Экспорт методов через ref
            useImperativeHandle(ref, () => ({
                goOn,
                break: breakProcess,
                reset,
                getCurrentPhase: () => currentPhase,
                isWaiting,
            }));

            // Создание элементов для Timeline
            const timelineItems = phaseOrder.map(phase => {
                const state = phasesState[phase];

                // Получение локализованных текстов
                const { header, comment } = mmConnectionComments(
                    phase,
                    state,
                    phaseTimestamps[phase]
                );

                // Настройка внешнего вида точки
                let color;
                let dot;

                switch (state) {
                    case MMConnectionStates.SUCCESS:
                        color = 'green'; // Зеленая точка
                        break;
                    case MMConnectionStates.FAIL:
                        color = 'red'; // Красная точка
                        break;
                    case MMConnectionStates.WAITING:
                        color = 'blue';
                        // Иконка часов с прозрачным фоном
                        dot = (
                            <span className={classes.transparentDot}>
                                <ClockCircleOutlined style={{ fontSize: '16px' }} />
                            </span>
                        );
                        break;
                    case MMConnectionStates.IN_PROGRESS:
                        // Анимированная иконка загрузки
                        dot = (
                            <span className={classes.transparentDot}>
                                <LoadingOutlined style={{ fontSize: '16px' }} spin />
                            </span>
                        );
                        break;
                }

                // Формирование элемента Timeline
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

            // Рендер компонента
            return (
                <div className={classes.container}>
                    <Timeline items={timelineItems} />
                </div>
            );
        });

// Установка имени для DevTools
MetaMaskConnectionTimeline.displayName = 'MetaMaskConnectionTimeline';
