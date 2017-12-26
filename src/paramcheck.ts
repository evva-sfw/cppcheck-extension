/**
 * @author Matthew Ferreira
 * @file Contains functions that check whether provided parameters are valid.
 */

import { includes } from 'lodash';

export function isValidStandard(standard: string): boolean {
  const allowedStandards = ['posix', 'c89', 'c99', 'c11', 'c++03', 'c++11', 'c++14'];
  return includes(allowedStandards, standard);
}

export function isValidPlatform(platform: string): boolean {
  const allowedPlatforms = ['unix32', 'unix64', 'win32A', 'win32W', 'win64', 'native'];
  return includes(allowedPlatforms, platform);
}

export function isValidLanguage(language: string): boolean {
  const allowLanguages = ['c', 'c++'];
  return includes(allowLanguages, language);
}
