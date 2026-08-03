import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  assertValidTemplateName,
  DEFAULT_TEMPLATE_EXTENSION,
  InvalidTemplateNameError,
  isPathInsideDirectory,
  listTemplateFiles,
  readTemplateSource,
  resolveTemplateDirectory,
  resolveTemplateDirectoryWithDiagnostics,
  TemplateFilesystem,
  TemplateIoError,
  toTemplateFilePath,
} from './template-directory.util';

function createErrnoError(
  code: NodeJS.ErrnoException['code'],
  message: string,
): NodeJS.ErrnoException {
  const error = new Error(message) as NodeJS.ErrnoException;
  error.code = code;
  return error;
}

function mockDirectoryStats(): fs.Stats {
  return {
    isDirectory: () => true,
    isFile: () => false,
  } as fs.Stats;
}

function createMockFilesystem(
  handlers: Partial<{
    statSync: (filePath: string) => fs.Stats;
    readdirSync: (directory: string) => readonly string[];
    readFileSync: (filePath: string, encoding: BufferEncoding) => string;
  }>,
): TemplateFilesystem {
  return {
    statSync: (filePath: string) => {
      if (handlers.statSync) return handlers.statSync(filePath);
      throw createErrnoError('ENOENT', `missing ${filePath}`);
    },
    readdirSync: (directory: string) => {
      if (handlers.readdirSync) return handlers.readdirSync(directory);
      throw createErrnoError('ENOENT', `missing ${directory}`);
    },
    readFileSync: (filePath: string, encoding: BufferEncoding) => {
      if (handlers.readFileSync) return handlers.readFileSync(filePath, encoding);
      throw createErrnoError('ENOENT', `missing ${filePath}`);
    },
  };
}

describe('template-directory.util', () => {
  describe('assertValidTemplateName', () => {
    it('accepts configured template identifiers', () => {
      expect(() => assertValidTemplateName('welcome')).not.toThrow();
      expect(() => assertValidTemplateName('reset-password')).not.toThrow();
      expect(() => assertValidTemplateName('blood_test.status')).not.toThrow();
    });

    it('rejects empty, absolute, traversal, and separator names', () => {
      const invalidNames = [
        '',
        '/etc/passwd',
        'C:\\windows\\system32',
        '../secret',
        'foo/bar',
        'foo\\bar',
        '..',
      ];

      for (const templateName of invalidNames) {
        expect(() => assertValidTemplateName(templateName)).toThrow(
          InvalidTemplateNameError,
        );
      }
    });
  });

  describe('isPathInsideDirectory', () => {
    it('accepts the directory itself and nested paths', () => {
      const parent = '/app/templates';
      expect(isPathInsideDirectory(parent, parent)).toBe(true);
      expect(isPathInsideDirectory(parent, '/app/templates/welcome.hbs')).toBe(
        true,
      );
    });

    it('rejects paths that escape the parent directory', () => {
      const parent = '/app/templates';
      expect(isPathInsideDirectory(parent, '/app/welcome.hbs')).toBe(false);
      expect(isPathInsideDirectory(parent, '/etc/passwd')).toBe(false);
    });
  });

  describe('toTemplateFilePath', () => {
    it('builds a resolved path with the default extension', () => {
      expect(toTemplateFilePath('/app/templates', 'welcome')).toBe(
        path.resolve('/app/templates', 'welcome.hbs'),
      );
    });

    it('supports configurable extensions with or without a leading dot', () => {
      expect(
        toTemplateFilePath('/app/templates', 'welcome', { extension: 'html' }),
      ).toBe(path.resolve('/app/templates', 'welcome.html'));
      expect(
        toTemplateFilePath('/app/templates', 'welcome', { extension: '.md' }),
      ).toBe(path.resolve('/app/templates', 'welcome.md'));
    });

    it('rejects invalid extensions', () => {
      expect(() =>
        toTemplateFilePath('/app/templates', 'welcome', { extension: '../x' }),
      ).toThrow(RangeError);
    });

    it('rejects path traversal template names', () => {
      expect(() =>
        toTemplateFilePath('/app/templates', '../../../etc/passwd'),
      ).toThrow(InvalidTemplateNameError);
    });
  });

  describe('resolveTemplateDirectory', () => {
    it('returns the first existing directory with runtime source', () => {
      const filesystem = createMockFilesystem({
        statSync: (filePath: string) => {
          if (filePath === '/missing') throw createErrnoError('ENOENT', 'missing');
          if (filePath === '/unreadable') {
            throw createErrnoError('EACCES', 'permission denied');
          }
          if (filePath === '/runtime/templates') return mockDirectoryStats();
          throw createErrnoError('ENOTDIR', 'not a directory');
        },
      });

      const resolution = resolveTemplateDirectory(
        ['/missing', '/unreadable', '/runtime/templates', '/other'],
        { filesystem },
      );

      expect(resolution).toEqual({
        directory: '/runtime/templates',
        source: 'runtime',
      });
    });

    it('falls back to the first candidate when none exist', () => {
      const filesystem = createMockFilesystem({
        statSync: () => {
          throw createErrnoError('ENOENT', 'missing');
        },
      });

      expect(
        resolveTemplateDirectory(['/first/fallback', '/second'], { filesystem }),
      ).toEqual({
        directory: '/first/fallback',
        source: 'fallback',
      });
    });

    it('returns null for an empty candidate list', () => {
      expect(resolveTemplateDirectory([])).toBeNull();
    });

    it('records unexpected filesystem errors in diagnostics', () => {
      const diagnostics = { errors: [] as TemplateIoError[] };
      const filesystem = createMockFilesystem({
        statSync: (filePath: string) => {
          if (filePath === '/denied') {
            throw createErrnoError('EACCES', 'permission denied');
          }
          throw createErrnoError('ENOENT', 'missing');
        },
      });

      const details = resolveTemplateDirectoryWithDiagnostics(['/denied'], {
        filesystem,
        diagnostics,
      });

      expect(details.resolution).toEqual({
        directory: '/denied',
        source: 'fallback',
      });
      expect(details.errors).toHaveLength(1);
      expect(details.errors[0]).toMatchObject({
        code: 'EACCES',
        path: '/denied',
        expected: false,
      });
    });

    it('does not record expected ENOENT errors while probing candidates', () => {
      const details = resolveTemplateDirectoryWithDiagnostics(['/missing'], {
        filesystem: createMockFilesystem({
          statSync: () => {
            throw createErrnoError('ENOENT', 'missing');
          },
        }),
      });

      expect(details.errors).toHaveLength(0);
    });
  });

  describe('listTemplateFiles', () => {
    it('returns a set of directory entries', () => {
      const filesystem = createMockFilesystem({
        readdirSync: () => ['welcome.hbs', 'invite.hbs'],
      });

      expect(listTemplateFiles('/templates', { filesystem })).toEqual(
        new Set(['welcome.hbs', 'invite.hbs']),
      );
    });

    it('returns null for a missing directory', () => {
      const filesystem = createMockFilesystem({
        readdirSync: () => {
          throw createErrnoError('ENOENT', 'missing');
        },
      });

      expect(listTemplateFiles('/missing', { filesystem })).toBeNull();
    });

    it('returns null and records diagnostics for unreadable directories', () => {
      const diagnostics = { errors: [] as TemplateIoError[] };
      const filesystem = createMockFilesystem({
        readdirSync: () => {
          throw createErrnoError('EACCES', 'permission denied');
        },
      });

      expect(
        listTemplateFiles('/denied', { filesystem, diagnostics }),
      ).toBeNull();
      expect(diagnostics.errors[0]).toMatchObject({
        code: 'EACCES',
        path: '/denied',
        expected: false,
      });
    });
  });

  describe('readTemplateSource', () => {
    it('reads template source text', () => {
      const filesystem = createMockFilesystem({
        readFileSync: () => '<p>Hello</p>',
      });

      expect(
        readTemplateSource('/templates/welcome.hbs', { filesystem }),
      ).toBe('<p>Hello</p>');
    });

    it('returns null for missing templates', () => {
      const filesystem = createMockFilesystem({
        readFileSync: () => {
          throw createErrnoError('ENOENT', 'missing');
        },
      });

      expect(
        readTemplateSource('/templates/missing.hbs', { filesystem }),
      ).toBeNull();
    });

    it('returns null and records diagnostics for unreadable templates', () => {
      const diagnostics = { errors: [] as TemplateIoError[] };
      const filesystem = createMockFilesystem({
        readFileSync: () => {
          throw createErrnoError('EACCES', 'permission denied');
        },
      });

      expect(
        readTemplateSource('/templates/welcome.hbs', {
          filesystem,
          diagnostics,
        }),
      ).toBeNull();
      expect(diagnostics.errors[0]).toMatchObject({
        code: 'EACCES',
        path: '/templates/welcome.hbs',
      });
    });
  });

  describe('integration with real filesystem', () => {
    let tempDirectory = '';

    beforeEach(() => {
      tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'pathologia-templates-'));
    });

    afterEach(() => {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    });

    it('resolves an existing directory on disk', () => {
      const resolution = resolveTemplateDirectory([tempDirectory]);
      expect(resolution).toEqual({
        directory: tempDirectory,
        source: 'runtime',
      });
    });

    it('lists and reads templates from disk', () => {
      const templatePath = path.join(tempDirectory, `welcome${DEFAULT_TEMPLATE_EXTENSION}`);
      fs.writeFileSync(templatePath, '<p>Welcome</p>', 'utf8');

      const files = listTemplateFiles(tempDirectory);
      expect(files?.has(`welcome${DEFAULT_TEMPLATE_EXTENSION}`)).toBe(true);
      expect(readTemplateSource(templatePath)).toBe('<p>Welcome</p>');
    });

    it('returns null when reading a missing on-disk template', () => {
      expect(
        readTemplateSource(
          path.join(tempDirectory, `missing${DEFAULT_TEMPLATE_EXTENSION}`),
        ),
      ).toBeNull();
    });
  });
});
