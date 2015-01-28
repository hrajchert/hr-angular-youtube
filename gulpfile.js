var gulp      = require('gulp'),
    concat    = require('gulp-concat'),
    prefix    = require('gulp-autoprefixer'),
    uglify    = require('gulp-uglify'),
    minifycss = require('gulp-minify-css'),
    rimraf    = require('gulp-rimraf'),
    rename    = require('gulp-rename'),
    html2js   = require('gulp-ng-html2js'),
    replace   = require('gulp-replace');

var fs = require('fs');

var options = JSON.parse(fs.readFileSync ('.env'));

gulp.task('process-scripts', function() {
    return gulp.src('./src/**/*.js')
        .pipe(concat('hr-angular-youtube.js'))
        .pipe(gulp.dest('./dist/'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/'));

});

gulp.task('process-templates', function() {
    return gulp.src('template/**/*.html')
        .pipe(html2js({
            moduleName: 'hrAngularYoutubeTpls',
            prefix :'/template/'
        }))
        .pipe(concat('templates.js'))
        .pipe(gulp.dest('./dist/'));
});
//gulp.task('process-scripts-with-tpl',['process-templates'], function() {
gulp.task('process-scripts-with-tpl',['process-templates','process-scripts'], function() {
    //
    return gulp.src(['./dist/templates.js','./dist/hr-angular-youtube.js'])
        .pipe(concat('hr-angular-youtube-tpl.js'))
        .pipe(replace('/*--TEMPLATE-DEPENDENCIES--*/',',\'hrAngularYoutubeTpls\''))
        .pipe(gulp.dest('./dist/'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/'));
});


gulp.task('process-styles', function() {
    return gulp.src('./assets/**/*.css')
        .pipe(concat('hr-angular-youtube.css'))
        .pipe(prefix('last 2 version'))
        .pipe(gulp.dest('./dist'))
        .pipe(minifycss())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('demo-cp', function() {
    return gulp.src('./demo/**/*')
        .pipe(gulp.dest(options.pagesDir + '/demo'));

});

gulp.task('docs-dist-cp',['process-scripts-with-tpl', 'process-styles'], function() {
    return gulp.src(['./dist/**/*','./bower_components/hr-angular-extend/src/hrAngularExtend.js'])
        .pipe(gulp.dest(options.pagesDir + '/dist'));
});


gulp.task('docs-mddoc', function(cb) {
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
    });
});

gulp.task('docs-clean', function() {
    return gulp.src(options.pagesDir + '/**/*.*', { read: false })
        .pipe(rimraf({force:true}))
        // For some reason I need to add a dest, or no end is triggered
        .pipe(gulp.dest(options.pagesDir));
});

gulp.task('build-docs', ['demo-cp', 'docs-dist-cp', 'docs-mddoc']);


gulp.task('docs',['docs-clean'], function(){
    return gulp.start('build-docs');
});

gulp.task('watch', function() {
    // This should be process script, but for some reason is not updating :(
    //    gulp.watch('./src/**/*.js', ['process-scripts']);
    gulp.watch('./src/**/*.js', ['docs']);

    gulp.watch('./assets/**/*.css', ['process-styles']);
    gulp.watch('./demo/**/*', ['docs']);
    gulp.watch(['./docs/**/*', '!./docs/custom-generator/bower_components/**'], ['docs']);
});


gulp.task('default', ['process-scripts-with-tpl', 'process-styles', 'docs','watch']);
