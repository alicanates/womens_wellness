'use client';

import { useTable } from '@refinedev/antd';
import { List } from '@refinedev/antd';
import { Table, Tag, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

export default function AnswersList() {
    const { tableProps } = useTable({
        resource: 'qna/answers',
        syncWithLocation: true,
    });

    const columns = [
        {
            title: 'Content',
            dataIndex: 'content',
            key: 'content',
            ellipsis: true,
            render: (text: string) => text.substring(0, 100) + '...',
        },
        {
            title: 'Question',
            dataIndex: ['question', 'title'],
            key: 'question',
            ellipsis: true,
        },
        {
            title: 'Author',
            dataIndex: ['user', 'email'],
            key: 'author',
        },
        {
            title: 'Best Answer',
            dataIndex: 'isBestAnswer',
            key: 'isBestAnswer',
            render: (isBest: boolean) => (
                isBest ? <Tag color="gold">Best Answer</Tag> : <Tag>Answer</Tag>
            ),
        },
        {
            title: 'Votes',
            dataIndex: 'voteCount',
            key: 'voteCount',
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
        },
    ];

    return (
        <List>
            <Table {...tableProps} columns={columns} rowKey="id" />
        </List>
    );
}
