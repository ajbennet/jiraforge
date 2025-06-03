import { properties, asApp, asUser, route } from '@forge/api';
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

resolver.define('getProjects', async () => {
    try {
        const result = await asApp().requestJira(route`/rest/api/3/project/search`);
        const data = await result.json();
        return data;
    } catch (error) {
        console.error('Error fetching projects:', error);
        throw error;
    }
});

resolver.define('saveRequiredInProject', async ({ payload }) => {
    try {
        const { requiredParts, projectKey } = payload;
        await properties.onJiraProject(projectKey).set('qa_demo_validator', requiredParts);
        return requiredParts;
    } catch (error) {
        console.error('Error saving required parts:', error);
        throw error;
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

export const handler = resolver.getDefinitions(); 