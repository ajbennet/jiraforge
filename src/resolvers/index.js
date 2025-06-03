import { properties, asApp, route } from '@forge/api';
import Resolver from '@forge/resolver';

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

const defaultParts = [
    { name: "QA Demo with design/PM", required: true },
    { name: "Front-End", required: true },
    { name: "Back-End", required: true },
    { name: "Screen resolutions", required: true },
    { name: "I18n", required: true },
    { name: "Edge cases", required: true },
    { name: "Error messages", required: true },
    { name: "Accessibility", required: true }
];

const resolver = new Resolver();

resolver.define('getEpicChildIssues', async ({ payload }) => {
    const { epicKey } = payload;
    // JQL to get all child issues of the Epic
    const jql = `"Epic Link" = ${epicKey}`;
    const result = await asApp().requestJira(route`/rest/api/3/search?jql=${encodeURIComponent(jql)}&fields=summary,status,assignee`);
    const data = await result.json();
    return (data.issues || []).map(issue => ({
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status?.name || 'Unknown',
        assignee: issue.fields.assignee?.displayName || 'Unassigned'
    })).filter(issue => CHECKLIST_TITLES.includes(issue.summary));
});

resolver.define('getValues', async ({ payload }) => {
    try {
        const { issueKey } = payload;
        const result = await properties.onJiraIssue(issueKey).get('qa_demo_validator');
        return result || defaultParts;
    } catch (error) {
        console.error('Error getting values:', error);
        return defaultParts;
    }
});

resolver.define('getRequiredInProject', async ({ payload }) => {
    try {
        const { projectKey } = payload;
        const result = await properties.onJiraProject(projectKey).get('qa_demo_validator');
        return result || defaultParts;
    } catch (error) {
        console.error('Error getting required parts:', error);
        return defaultParts;
    }
});

resolver.define('saveValues', async ({ payload }) => {
    try {
        const { formData, issueKey } = payload;
        await properties.onJiraIssue(issueKey).set('qa_demo_validator', formData);
        return formData;
    } catch (error) {
        console.error('Error saving values:', error);
        throw error;
    }
});

export const handler = resolver.getDefinitions(); 