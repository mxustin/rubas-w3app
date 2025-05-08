// Атомарный компонент: кнопка "Отмена" [★★★★★]

import { Button, type ButtonProps } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

import log from '@/log';

import classes from './CancelButton.module.scss';

/**
 * CancelButton - атомарная кнопка на базе Ant Design для отмены действий, закрытия модальных окон без сохранения
 * результатов, или для прерывания каких-либо процессов. Кнопка является атомарным элементом (Atomic Design) и
 * предназначена для прерывания каких-либо процессов или отмены каких-либо действий. Можно передавать любые свойства,
 * поддерживаемые AntD Button (disabled, icon и т.д.). Поддерживает автоматическую логику локализации текста,
 * переданного в children, с помощью i18n. Для перевода текста используется ключ из props.children. Возможно
 * использование кастомных надписей. Поддерживает логирование при нажатии.
 *
 * @component CancelButton
 * @category Atoms
 * @example
 *   <CancelButton onCancel={handleCancel}>Отмена</CancelButton>
 */

export const CancelButton: React.FC<ButtonProps & { onCancel: () => void }> = (props) => {
    const { t } = useTranslation();
    const componentName = 'CancelButton';

    // Выполнение нажатия с логированием
    const handleClick = () => {
        log.debug(`Кнопка ${componentName}: произошло нажатие пользователем.`);
        props.onCancel();
    };

    return (
        <Button
            type="default"
            danger
            onClick={handleClick}
            className={classes['cancel-button']}
            {...props}
        >
            {props.children ?? t('cancelButton.label')}
        </Button>
    );
};
