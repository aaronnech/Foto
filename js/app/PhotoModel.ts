/**
 * A PhotoModel is the data the describes a photograph
 */
class PhotoModel {
    public static BASE_GALLERY_PATH : string = 'gallery/';
    private category : KnockoutObservable<string>;
    private path : KnockoutObservable<string>;
    private smallPath : KnockoutObservable<string>;
    private mediumPath : KnockoutObservable<string>;

    /**
     * Constructs a PhotoModel
     * @param category The category this photo belongs to
     * @param path The path of this photo's file
     * @param cache A cache postfix dictionary for sizes.
     */
    constructor(category : string, path : string, cache : {[id : string] : string}) {
        this.category = ko.observable(category);
        this.path = ko.observable(PhotoModel.BASE_GALLERY_PATH + path);
        this.smallPath = ko.observable(PhotoModel.BASE_GALLERY_PATH + path + cache['small']);
        this.mediumPath = ko.observable(PhotoModel.BASE_GALLERY_PATH + path + cache['medium']);
    }

    /**
     * Gets the category associated with this PhotoModel
     * @returns {any}
     */
    public getCategory() : string {
        return this.category();
    }

    /**
     * Handles loading this PhotoModel
     * @param photo The current photoModel
     * @param e The event associated with this load
     */
    private onLoad(photo, e) {
        var loader = $(e.target).siblings('.loader');
        loader.hide();
    }
}