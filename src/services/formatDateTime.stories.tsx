// История и тест для функции форматирования даты и времени

import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';
import { formatDateTime } from './formatDateTime';
import { useTranslation } from 'react-i18next';

type FormatDateTimeExampleProps = {
    date?: Date;
};

const FormatDateTimeExample: React.FC<FormatDateTimeExampleProps> = ({ date }) => {
    const { i18n } = useTranslation();
    const [output, setOutput] = useState('');

    useEffect(() => {
        setOutput(formatDateTime(date));
    }, [date, i18n.language]);

    return (
        <div>
            <p>
                <strong>Locale:</strong> {i18n.language}
            </p>
            <p>
                <strong>Input:</strong> {date?.toString() ?? 'не передано (текущее время)'}
            </p>
            <p>
                <strong>Output:</strong> {output}
            </p>
        </div>
    );
};

const meta: Meta<typeof FormatDateTimeExample> = {
    title: 'Services/formatDateTime',
    component: FormatDateTimeExample,
    tags: ['autodocs'],
    parameters: {
        docs: {
            page: undefined,
        },
    },
};

export default meta;

type Story = StoryObj<typeof FormatDateTimeExample>;

export const Default: Story = {
    args: {},
};

export const WithSpecificDate: Story = {
    args: {
        date: new Date('2024-05-01T09:05:03'),
    },
};

export const EndOfYear: Story = {
    args: {
        date: new Date('2024-12-31T23:59:59'),
    },
};