import { properties } from '@forge/api';
import Resolver from '@forge/resolver';

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