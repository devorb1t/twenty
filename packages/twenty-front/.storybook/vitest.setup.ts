import { setProjectAnnotations } from '@storybook/react-vite';
import * as projectAnnotations from './preview';

// Pre-warm all dynamic imports used by WorkflowStepDecorator so the
// modules are cached before any test runs (avoids flaky timeouts in CI).
// preloadMockedMetadata dynamically imports objects, views, and navigation
// menu items data — warming them here prevents race conditions in CI.
import { preloadMockedMetadata } from '@/metadata-store/utils/preloadMockedMetadata';

preloadMockedMetadata();

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
setProjectAnnotations([projectAnnotations]);
