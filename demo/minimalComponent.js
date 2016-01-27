/*
 * A minimal set of features to go on top of polymer-micro:
 *
 *   1. Creation of a shadow root
 *   2. <template> instantiation
 *   3. Shimming of CSS styles under the Shadow DOM polyfill
 *   4. Polymer-style automatic node finding (not sure if we really need this)
 *
 * This set of features is packaged as a Polymer behavior, so it can be mixed
 * in to a component with the "behaviors" key:
 *
 *   Polymer({
 *     behaviors: [MinimalComponent],
 *     ...
 *   });
 *
 */

(function () {

// Polymer-style automatic node finding.
// See https://www.polymer-project.org/1.0/docs/devguide/local-dom.html#node-finding.
// This feature is not available in polymer-micro, so we provide a basic
// version of this ourselves.
function createReferencesToNodesWithIds(instance) {
    instance.$ = {};
    var nodesWithIds = instance.root.querySelectorAll('[id]');
    [].forEach.call(nodesWithIds, function (node) {
        var id = node.getAttribute('id');
        instance.$[id] = node;
    });
}

// Invoke basic style shimming with ShadowCSS.
function shimTemplateStyles(template, tag) {
    if (window.ShadowDOMPolyfill) {
        WebComponents.ShadowCSS.shimStyling(template.content, tag);
    }
    template._initialized = true;
}

window.MinimalComponent = {


    // Use polymer-micro created callback to initialize the component.
    created: function () {

        if (this.template) {

            if (!this.template._initialized) {
                shimTemplateStyles(this.template, this.is);
            }

            // Instantiate template.
            if (this.template.getAttribute("noshadowroot") !== null) {
                this.root = this;
            } else {
                this.root = this.createShadowRoot();
            }
            var clone = document.importNode(this.template.content, true);
            this.root.appendChild(clone);

            //if( this.template.getAttribute("noshadowroot") === null ){
            // Create this.$.<id> properties.
            createReferencesToNodesWithIds(this);
            //}
        }

        // Initialize property values from attributes.
        // This invokes an undocumented method internal to Polymer.
        this._takeAttributesToModel(this);

        // Shortcut for this.root.querySelector(). 
        // Mainly useful when not using a shadow root, 
        // where the this.$ syntax shouldn't really be used
        this.qs = this.root.querySelector.bind(this.root);
    }

};

})();
