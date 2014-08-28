var gulp      = require('gulp'),
    concat    = require('gulp-concat'),
    prefix    = require('gulp-autoprefixer'),
    uglify    = require('gulp-uglify'),
    minifycss = require('gulp-minify-css'),
    rimraf    = require('gulp-rimraf'),
    rename    = require('gulp-rename');

var fs = require('fs'),
    when = require('when');

var options = null;

function loadOptions() {
    if (options === null) {
        options = when.promise(function(resolve,reject) {
            fs.readFile('.env', function(err, file) {
                if (err) {
                    return reject(err);
                }
                resolve(JSON.parse(file));
            });
        });
    }
    return options;
}

gulp.task('process-scripts', function() {
    gulp.src('./src/**/*.js')
        .pipe(concat('hr-angular-youtube.js'))
        .pipe(gulp.dest('./dist/'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/'));

});

gulp.task('process-styles', function() {
    gulp.src('./assets/**/*.css')
        .pipe(concat('hr-angular-youtube.css'))
        .pipe(prefix('last 2 version'))
        .pipe(gulp.dest('./dist'))
        .pipe(minifycss())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('demo-cp', function(cb) {
    loadOptions().then(function(options) {
        gulp.src('./demo/**/*').
            pipe(gulp.dest(options.pagesDir + '/demo')).
            on('end', cb);
    }, function() {
        console.error('could not load options file');
    });

});

gulp.task('docs-dist-cp',['process-scripts', 'process-styles'], function(cb) {
    loadOptions().then(function(options) {
        gulp.src('./dist/**/*').
            pipe(gulp.dest(options.pagesDir + '/dist')).
            on('end', cb);
    });

});


gulp.task('docs-mddoc', function(cb) {
    loadOptions().then(function(options) {
        var mddoc  = require('mddoc'),
            config = mddoc.config;

        // Load the project settings
        var mddocSettings = config.loadConfig(process.cwd(), {outputDir: options.pagesDir});

        // Run the tool
        mddocSettings.done(function(settings) {
            mddoc.verbose(true);
            mddoc.initialize(settings);

            var steps = [
                mddoc.readMarkdown,
                mddoc.readCode,
                mddoc.saveMetadata,
                mddoc.replaceReferences,
                mddoc.generateOutput
            ];

            mddoc.run(steps).then(function () {
                cb();
            }, function(err) {
                console.error('There was an error running the tool ' + JSON.stringify(err));
                cb(false);
            });
        }, function (err) {
            console.error('Coundn\'t read the settings '+ JSON.stringify(err));
            cb(false);
        });

    });
});

gulp.task('docs-clean', function(cb) {
    loadOptions().then(function(options) {
        gulp.src(options.pagesDir + '/**/*.*', { read: false })
        .pipe(rimraf({force:true}))
        // For some reason I need to add a dest, or no end is triggered
        .pipe(gulp.dest(options.pagesDir))
        .on('end', cb);
    });
});

gulp.task('build-docs', ['demo-cp', 'docs-dist-cp', 'docs-mddoc']);

// docs-clean removes git
//gulp.task('docs',['docs-clean'], function(){
gulp.task('docs', function(){
    return gulp.start('build-docs');
});

gulp.task('watch', function() {
    // This should be process script, but for some reason is not updating :(
    //    gulp.watch('./src/**/*.js', ['process-scripts']);
    gulp.watch('./src/**/*.js', ['process-scripts','docs']);
    gulp.watch('./assets/**/*.css', ['process-styles']);
    gulp.watch('./demo/**/*', ['docs']);
    gulp.watch(['./docs/**/*', '!./docs/custom-generator/bower_components/**'], ['docs']);
});


gulp.task('default', ['process-scripts', 'process-styles', 'docs','watch']);
