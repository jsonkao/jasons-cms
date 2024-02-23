/**
 * This module boots a webcontainer instance and creates a manager for it
 */

import { createWebContainer } from './create';
import { createWebContainerManager } from './manager';

const manager = createWebContainerManager(createWebContainer);

export const initializeWebContainerPageFiles = manager.initializeWebContainerPageFiles;
export const syncWebContainerFileSystem = manager.syncWebContainerFileSystem;
export const saveComponentOrGlobalFile = manager.saveComponentOrGlobalFile;
