module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    browserify: {
      main: {
        options: {
          debug: true,
          transform: ['reactify'],
          aliasMappings: [
            {
              cwd: 'app/views',
              src: ['**/*.jsx'],
              dest: 'app/views'
            }
          ],
        },
        files: {
          'static/scripts.js': 'app/entry.js',
        },
      },
    },

    uglify: {
      main: {
        options: {
          mangle: true,
          compress: true,
        },
        files: {
          'static/scripts.js': ['static/scripts.js']
        }
      }
    },

    nodemon: {
      main: {}
    },

    watch: {
      app: {
        files: 'app/**/*',
        tasks: ['browserify'],
        options: {
          interrupt: true
        }
      }
    },

    concurrent: {
      main: {
        tasks: ['nodemon', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');

  grunt.registerTask('compile', ['browserify']);
  grunt.registerTask('default', ['compile']);
  grunt.registerTask('deploy-compile', ['compile', 'uglify']);
  grunt.registerTask('server', ['compile', 'concurrent']);
};
