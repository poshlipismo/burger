var gulp    	 	= require('gulp'),
    sass    	 	= require('gulp-sass'),
    concat	 		= require('gulp-concat'),
    uglify	 		= require('gulp-uglifyjs'),
    cssnano	 		= require('gulp-cssnano'),
    rename	 		= require('gulp-rename'),
    del		 		= require('del'),
    imagemin	 	= require('gulp-imagemin'),
    pngquant	 	= require('imagemin-pngquant'),
    cache	 		= require('gulp-cache'),
	autoprefixer 	= require('gulp-autoprefixer'),
	font2css		= require('gulp-font2css').default,
	htmlhint		= require('gulp-htmlhint'),
    browserSync  	= require('browser-sync');

/* 
* Файлы шрифтов, для использования font2css:
* <family>[-<weight>][-<style>].<extension>
*/

gulp.task('font2css', function() {
	return gulp.src('app/fonts/**/*.{otf,ttf,woff,woff2}')
		.pipe(font2css())
		.pipe(concat('_gulp_fonts.scss'))
		.pipe(gulp.dest('app/sass/fonts'));
});	

gulp.task('build-css', function() {
	return gulp.src(['app/sass/**/*.+(scss|sass)'])
		.pipe(sass({
			outputStyle: 'expanded'
		}).on('error', sass.logError))
		.pipe(concat('style.min.css'))
		.pipe(cssnano())
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

gulp.task('scripts', function() {
	return gulp.src(['app/libs/jquery/dist/jquery.min.js'])
		.pipe(concat('libs.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('app/js'));
});

gulp.task('css-libs', ['build-css'], function() {
	return gulp.src('app/css/libs.css')
		.pipe(cssnano())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest('app/css'));
});

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false
	});
});

gulp.task('clean', function() {
	return del.sync('dist');
});

gulp.task('clear', function() {
	return cache.clearAll();
});

gulp.task('img', function() {
	return gulp.src('app/img/**/*')
	    .pipe(cache(imagemin({
	    	interlaced: true,
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
		une: [pngquant()]
	    })))
	    .pipe(gulp.dest('dist/img'));
});

gulp.task('watch', ['browser-sync', 'css-libs', 'scripts'], function() {
	gulp.watch('app/sass/**/*.+(scss|sass)', ['build-css']);
	gulp.watch('app/*.html', browserSync.reload);
	gulp.watch('app/js/**/*.js', browserSync.reload);
});

gulp.task('htmlhint', function() {
	return gulp.src('app/index.html')
		.pipe(htmlhint({
			"tagname-lowercase": true,
			"attr-lowercase": true,
			"attr-value-double-quotes": true,
			"attr-value-not-empty": false,
			"attr-no-duplication": true,
			"doctype-first": true,
			"tag-pair": true,
			"tag-self-close": false,
			"spec-char-escape": true,
			"id-unique": true,
			"src-not-empty": true,
			"title-require": true,
			"alt-require": true,
			"doctype-html5": true,
			"id-class-value": "dash",
			"style-disabled": false,
			"inline-style-disabled": false,
			"inline-script-disabled": false,
			"space-tab-mixed-disabled": "space",
			"id-class-ad-disabled": false,
			"href-abs-or-rel": false,
			"attr-unsafe-chars": true,
			"head-script-disabled": true
		  }))
		.pipe(gulp.dest('dist'));
});

gulp.task('build', ['clean', 'img', 'build-css', 'scripts'], function() {
	var buildCss = gulp.src([
		'app/css/main.css',
		'app/css/libs.min.css'
	    ])
	    .pipe(gulp.dest('dist/css'));

	var buildFonts = gulp.src([
		'app/fonts/**/*'
	    ])
	    .pipe(gulp.dest('dist/fonts'));
	
	var buildJs = gulp.src([
		'app/js/**/*'
	    ])
	    .pipe(gulp.dest('dist/js'));
	
	var buildHtml = gulp.src('app/*.html')
	    .pipe(gulp.dest('dist'));
});