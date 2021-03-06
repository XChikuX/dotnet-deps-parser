#!/usr/bin/env node_modules/.bin/ts-node
// Shebang is required, and file *has* to be executable: chmod +x file.test.js
// See: https://github.com/tapjs/node-tap/issues/313#issuecomment-250067741
// tslint:disable:max-line-length
// tslint:disable:object-literal-key-quotes
import {test} from 'tap';
import * as fs from 'fs';
import {extractTargetFrameworksFromFiles} from '../../lib';

const load = (filename) => JSON.parse(
  fs.readFileSync(`${__dirname}/../fixtures/${filename}`, 'utf8'),
);

test('.Net Visual Basic project target framework extracted as expected', async (t) => {
    const targetFrameworks = await extractTargetFrameworksFromFiles(
        `${__dirname}/../fixtures/dotnet-vb-simple-project`,
        'manifest.vbproj');
    t.deepEqual(targetFrameworks, ['.NETFramework,Version=v4.6.1'], 'targetFramework array is as expected');
});

test('.Net F# project target framework extracted as expected', async (t) => {
  const targetFrameworks = await extractTargetFrameworksFromFiles(
    `${__dirname}/../fixtures/dotnet-fs-simple-project`,
    'manifest.fsproj');
  t.deepEqual(targetFrameworks, ['netcoreapp2.1'], 'targetFramework array is as expected');
});

/*
****** csproj ******
*/

test('.Net .csproj simple project target framework extracted as expected', async (t) => {
  const targetFrameworks = await extractTargetFrameworksFromFiles(
    `${__dirname}/../fixtures/dotnet-core-simple-project`,
    'simple-project.csproj');
  t.deepEqual(targetFrameworks, ['netcoreapp1.1', 'netcoreapp1.2'], 'targetFramework array is as expected');
});

test('.Net .csproj dotnet-empty-manifest target framework extracted', async (t) => {
  const targetFrameworks = await extractTargetFrameworksFromFiles(
    `${__dirname}/../fixtures/dotnet-empty-manifest`,
    'empty-manifest.csproj');
  t.deepEqual(targetFrameworks, [], 'targetFramework array is as expected');
});

/*
****** fsproj ******
*/

test('.Net .fsproj simple project target framework extracted as expected', async (t) => {
  const targetFrameworks = await extractTargetFrameworksFromFiles(
    `${__dirname}/../fixtures/dotnet-fs-simple-project`,
    'manifest.fsproj');
  t.deepEqual(targetFrameworks, ['netcoreapp2.1'], 'targetFramework array is as expected');
});

/*
****** packages.config ******
*/

test('.Net packages.config single target framework extracted as expected', async (t) => {
  const targetFrameworks = await extractTargetFrameworksFromFiles(
    `${__dirname}/../fixtures/dotnet-simple-project`,
    'packages.config');
  t.deepEqual(targetFrameworks, ['net46'], 'targetFramework array is as expected');
});

test('.Net packages.config multiple target frameworks extracted as expected', async (t) => {
  const targetFrameworks = await extractTargetFrameworksFromFiles(
    `${__dirname}/../fixtures/dotnet-multiple-target-frameworks`,
    'packages.config');
  t.deepEqual(targetFrameworks, ['net46', 'net451'], 'targetFramework array is as expected');
});

test('.Net packages.config dotnet-empty-manifest target framework extracted', async (t) => {
  const targetFrameworks = await extractTargetFrameworksFromFiles(
    `${__dirname}/../fixtures/dotnet-empty-manifest`,
    'packages.config');
  t.deepEqual(targetFrameworks, [], 'targetFramework array is as expected');
});
