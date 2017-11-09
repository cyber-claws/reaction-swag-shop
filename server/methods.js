import { Shops, Products, Tags, Shipping, Media } from "/lib/collections";
import { Logger } from "/server/api";

function checkForShops() {
  const numShops = Shops.find().count();
  return numShops;
}

function checkForProducts() {
  const numProducts = Products.find().count();
  return numProducts !== 0;
}

function checkForTags() {
  const numTags = Tags.find().count();
  return numTags !== 0;
}

function checkForShipping() {
  const numShipping = Shipping.find().count();
  return numShipping !== 0;
}

function checkForMedia() {
  const numMedia = Media.find().count();
  return numMedia !== 0;
}

const methods = {};

methods.loadShops = function() {
  Logger.info("Starting load Shops");
  if (!checkForShops()) {
    const shops =   require("/imports/plugins/custom/reaction-swag-shop/private/data/Shops.json");
    shops.forEach((shop) => {
      Shops.insert(shop);
    });
    Logger.info("Shops loaded");
  }
};

methods.loadProducts = function() {
  Logger.info("Starting load Products");
  if (!checkForProducts()) {
    const products = require("/imports/plugins/custom/reaction-swag-shop/private/data/Products.json");
    products.forEach((product) => {
      product.createdAt = new Date();
      product.updatedAt = new Date();
      Products.direct.insert(product);
    });
    Logger.info("Products loaded");
  } else {
    Logger.info("Products skipped. Already exists");
  }
};

methods.loadTags = function() {
  if (!checkForTags()) {
    Logger.info("Starting load Tags");
    const tags = require("/imports/plugins/custom/reaction-swag-shop/private/data/Tags.json");
    tags.forEach((tag) => {
      tag.updatedAt = new Date();
      Tags.insert(tag);
    });
    Logger.info("Tags loaded");
  }
};

methods.loadShipping = function() {
  if (!checkForShipping()) {
    Logger.info("Starting load Shipping");
    const shipping = require("/imports/plugins/custom/reaction-swag-shop/private/data/Shipping.json");
    shipping.forEach((shippingRecord) => {
      Shipping.insert(shippingRecord);
    });
    Logger.info("Shipping loaded");
  }
};

methods.enableShipping = function() {
  // Enable flat rate shipping records
};

methods.enablePayment = function() {
  // Enable the example payment method
};

methods.importProductImages = function() {
  if (!checkForMedia()) {
    const products = Products.find({ type: "simple" }).fetch();
    for (const product of products) {
      const productId = product._id;
      if (!Media.findOne( {"metadata.productId": productId })) {
        const shopId = product.shopId;
        const filepath = "custom/images/" + productId + ".jpg";
        const binary = Assets.getBinary(filepath);
        const fileObj = new FS.File();
        const fileName = `${productId}.jpg`;
        fileObj.attachData(binary, { type: "image/jpeg", name: fileName });
        fileObj.metadata = {
          productId: productId,
          toGrid: 1,
          shopId: shopId,
          priority: 0,
          workflow: "published"
        };
        Media.insert(fileObj);
      }
    }
  }
};

methods.resetData = function() {
  // delete existing data
  Shipping.remove({});
  Tags.remove({});
  Products.remove({});
  Shops.remove({});
  // add data back in
  methods.loadShops();
  methods.loadProducts();
  methods.loadTags();
  methods.loadShipping();
};

export default methods;
