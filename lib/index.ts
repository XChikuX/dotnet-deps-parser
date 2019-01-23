import 'source-map-support/register';
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';

import {PkgTree, DepType, parseManifestFile,
  getDependencyTreeFromPackagesConfig, getDependencyTreeFromProjectJson,
  getDependencyTreeFromProjectFile, ProjectJsonManifest,
  getTargetFrameworksFromProjectFile,
  getTargetFrameworksFromProjectConfig,
  getTargetFrameworksFromProjectJson} from './parsers';

const PROJ_FILE_EXTENSIONS = [
  '.csproj',
  '.vbproj',
  '.fsproj',
];

export {
  buildDepTreeFromPackagesConfig,
  buildDepTreeFromProjectFile,
  buildDepTreeFromProjectJson,
  buildDepTreeFromFiles,
  extractTargetFrameworksFromFiles,
  extractTargetFrameworksFromProjectFile,
  extractTargetFrameworksFromProjectConfig,
  containsPackageReference,
  extractTargetFrameworksFromProjectJson,
  PkgTree,
  DepType,
};

function buildDepTreeFromProjectJson(manifestFileContents: string, includeDev = false): PkgTree {
  // trimming required to address files with UTF-8 with BOM encoding
  const manifestFile: ProjectJsonManifest = JSON.parse(manifestFileContents.trim());
  return getDependencyTreeFromProjectJson(manifestFile, includeDev);
}

async function buildDepTreeFromPackagesConfig(
    manifestFileContents: string,
    includeDev = false): Promise<PkgTree> {
  const manifestFile: any = await parseManifestFile(manifestFileContents);
  return getDependencyTreeFromPackagesConfig(manifestFile, includeDev);
}

async function buildDepTreeFromProjectFile(
    manifestFileContents: string,
    includeDev = false): Promise<PkgTree> {
  const manifestFile: any = await parseManifestFile(manifestFileContents);
  return getDependencyTreeFromProjectFile(manifestFile, includeDev);
}

function buildDepTreeFromFiles(
  root: string, manifestFilePath: string, includeDev = false) {
  if (!root || !manifestFilePath) {
    throw new Error('Missing required parameters for buildDepTreeFromFiles()');
  }

  const manifestFileFullPath = path.resolve(root, manifestFilePath);

  if (!fs.existsSync(manifestFileFullPath)) {
    throw new Error('No packages.config, project.json or project file found at ' +
      `location: ${manifestFileFullPath}`);
  }

  const manifestFileContents = fs.readFileSync(manifestFileFullPath, 'utf-8');
  const manifestFileExtension = path.extname(manifestFileFullPath);

  if (_.includes(PROJ_FILE_EXTENSIONS, manifestFileExtension)) {
    return buildDepTreeFromProjectFile(manifestFileContents, includeDev);
  } else if (_.endsWith(manifestFilePath, 'packages.config')) {
    return buildDepTreeFromPackagesConfig(manifestFileContents, includeDev);
  } else if (_.endsWith(manifestFilePath, 'project.json')) {
    return buildDepTreeFromProjectJson(manifestFileContents, includeDev);
  } else {
    throw new Error(`Unsupported file ${manifestFilePath}, Please provide ` +
      'either packages.config or project file.');
  }
}

function extractTargetFrameworksFromFiles(
  root: string, manifestFilePath: string, includeDev = false) {
  if (!root || !manifestFilePath) {
    throw new Error('Missing required parameters for extractTargetFrameworksFromFiles()');
  }

  const manifestFileFullPath = path.resolve(root, manifestFilePath);

  if (!fs.existsSync(manifestFileFullPath)) {
    throw new Error('No project file found at ' +
      `location: ${manifestFileFullPath}`);
  }

  const manifestFileContents = fs.readFileSync(manifestFileFullPath, 'utf-8');
  const manifestFileExtension = path.extname(manifestFileFullPath);

  if (_.includes(PROJ_FILE_EXTENSIONS, manifestFileExtension)) {
    return extractTargetFrameworksFromProjectFile(manifestFileContents);
  } else if (_.endsWith(manifestFilePath, 'packages.config')) {
    return extractTargetFrameworksFromProjectConfig(manifestFileContents);
  } else if (_.endsWith(manifestFilePath, 'project.json')) {
    return extractTargetFrameworksFromProjectJson(manifestFileContents);
  } else {
    throw new Error(`Unsupported file ${manifestFilePath}, Please provide ` +
      'a project *.csproj, *.vbproj, *.fsproj or packages.config file.');
  }
}

async function extractTargetFrameworksFromProjectFile(
  manifestFileContents: string): Promise<string[]> {
  try {
    const manifestFile: any = await parseManifestFile(manifestFileContents);
    return getTargetFrameworksFromProjectFile(manifestFile);
  } catch (err) {
    throw new Error(`Extracting target framework failed with error ${err.message}`);
  }
}

async function extractTargetFrameworksFromProjectConfig(
  manifestFileContents: string): Promise<string[]> {
  try {
    const manifestFile: any = await parseManifestFile(manifestFileContents);
    return getTargetFrameworksFromProjectConfig(manifestFile);
  } catch (err) {
    throw new Error(`Extracting target framework failed with error ${err.message}`);
  }
}

async function containsPackageReference(manifestFileContents: string) {

  const manifestFile: any = await parseManifestFile(manifestFileContents);

  const projectItems = _.get(manifestFile, 'Project.ItemGroup', []);
  const referenceIndex = _.findIndex(projectItems, (itemGroup) => _.has(itemGroup, 'PackageReference'));

  return referenceIndex !== -1;
}

async function extractTargetFrameworksFromProjectJson(
  manifestFileContents: string): Promise<string[]> {
  try {
    // trimming required to address files with UTF-8 with BOM encoding
    const manifestFile = JSON.parse(manifestFileContents.trim());
    return getTargetFrameworksFromProjectJson(manifestFile);
  } catch (err) {
    throw new Error(`Extracting target framework failed with error ${err.message}`);
  }
}
