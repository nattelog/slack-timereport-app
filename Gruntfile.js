module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      all: ['index.js', 'test/*.js', 'lib/*.js']
    },

    nodeunit: {
      all: ['test/*-tests.js'],
      options: {
	reporter: 'default'
      }
    },

    watch: {
      options: {
	atBegin: true
      },
      dev: {
	files: ['index.js', 'test/*.js', 'lib/*.js'],
	tasks: ['express:dev', 'jshint', 'nodeunit', 'express:dev:stop']
      },
      prod: {
	files: ['index.js', 'lib/*.js', 'config.js'],
	tasks: ['express:prod'],
	options: {
	  spawn: false
	}
      }
    },

    express: {
      dev: {
	options: {
	  script: 'bin/www',
	  port: 3001,
	  node_env: 'dev'
	}
      },
      prod: {
	options: {
	  script: 'bin/www',
	  port: 3000,
	  node_env: 'prod'
	}
      }
    }
  });

  require('grunt-task-loader')(grunt);
  grunt.loadNpmTasks('grunt-express-server');

  grunt.registerTask('dev', ['watch:dev']);
  grunt.registerTask('prod', ['watch:prod']);
};
