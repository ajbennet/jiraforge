import React, { useEffect, useState } from 'react';
import ForgeReconciler from '@forge/react';
import { Text } from '@forge/react';
import { useProductContext } from '@forge/react';
import { invoke } from '@forge/bridge';

const CHECKLIST_TITLES = [
    "Legal Review",
    "Launch and Sales Enablement",
    "Documentation",
    "Feature Training",
    "Customer Support Enablement",
    "Data Science - Metrics",
    "Pricing and Monetization",
    "Sales Operations Coordination"
];

const App = () => {
    const context = useProductContext();
    console.log('Forge context:', context);

    if (!context) {
        return <Text>Loading context...</Text>;
    }

    const issueKey =
        context?.platformContext?.issueKey ||
        context?.issueKey ||
        context?.contentId ||
        context?.extension?.issue?.key;

    if (!issueKey) {
        return (
            <Text>
                Could not determine issue key from context. Context: {JSON.stringify(context)}
            </Text>
        );
    }

    const [childIssues, setChildIssues] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChildIssues = async () => {
            setLoading(true);
            try {
                const result = await invoke('getEpicChildIssues', { epicKey: issueKey });
                setChildIssues(result);
            } catch (err) {
                console.error('Error loading child issues:', err);
                setError('Failed to load child issues');
            } finally {
                setLoading(false);
            }
        };
        fetchChildIssues();
    }, [issueKey]);

    if (loading) {
        return <Text>Loading checklist...</Text>;
    }
    if (error) {
        return <Text>{error}</Text>;
    }

    // Map checklist to real child issues
    const checklist = CHECKLIST_TITLES.map(title => {
        const match = childIssues.find(issue => issue.summary === title);
        return {
            title,
            status: match ? match.status : 'Not Created',
            assignee: match ? match.assignee : 'Unassigned'
        };
    });

    console.log('checklist', checklist);

    if (!Array.isArray(checklist) || checklist.some(item => !item || typeof item !== 'object')) {
        return <Text>Checklist data is invalid.</Text>;
    }

    return (
        <>
            <Text weight="bold" size="large">Product Checklist</Text>
            {checklist.map(item => (
                <Text key={String(item.title)}>
                    • {String(item.title || '')} — Status: {String(item.status || '')} — Assignee: {String(item.assignee || '')}
                </Text>
            ))}
        </>
    );
};

ForgeReconciler.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
); 