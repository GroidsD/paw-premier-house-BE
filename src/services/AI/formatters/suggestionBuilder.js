const getSuggestionsByContext = ({
    language,
    contextType,
    isLoggedIn,
    intent,
    context,
}) => {
    const analysis = context?.analysis || {};
    const petType = analysis.petType || null;
    const discountMode = analysis.discountMode || null;
    const productForm = analysis.productForm || null;
    const answerMode = context?.answer_mode || null;

    if (contextType === "auth_required") {
        return language === "en"
            ? ["Log in", "Dog products", "Grooming services"]
            : ["Đăng nhập", "Sản phẩm cho chó", "Dịch vụ grooming"];
    }

    if (contextType === "knowledge") {
        if (language === "en") {
            if (petType === "cat" && productForm === "pate") {
                return ["How to use cat pate", "Cat food", "Cat pate"];
            }
            if (petType === "dog" && productForm === "pate") {
                return ["How to use dog pate", "Dog food", "Dog pate"];
            }
            if (petType === "cat") {
                return ["Cat food", "Usage guide", "Related products"];
            }
            if (petType === "dog") {
                return ["Dog food", "Usage guide", "Related products"];
            }
            return ["Usage guide", "Related products", "Services"];
        }

        if (petType === "cat" && productForm === "pate") {
            return [
                "Cách dùng pate cho mèo",
                "Pate cho mèo",
                "Thức ăn cho mèo",
            ];
        }
        if (petType === "dog" && productForm === "pate") {
            return [
                "Cách dùng pate cho chó",
                "Pate cho chó",
                "Thức ăn cho chó",
            ];
        }
        if (petType === "cat") {
            return ["Thức ăn cho mèo", "Cách sử dụng", "Sản phẩm liên quan"];
        }
        if (petType === "dog") {
            return ["Thức ăn cho chó", "Cách sử dụng", "Sản phẩm liên quan"];
        }
        return ["Cách sử dụng", "Sản phẩm liên quan", "Dịch vụ"];
    }

    if (contextType === "external_reference") {
        if (language === "en") {
            if (petType === "cat") {
                return ["Cat nutrition", "Omega 3 for cats", "Cat care"];
            }
            if (petType === "dog") {
                return ["Dog nutrition", "Omega 3 for dogs", "Dog care"];
            }
            return ["Pet nutrition", "Pet care", "Related products"];
        }

        if (petType === "cat") {
            return ["Dinh dưỡng cho mèo", "Omega 3 cho mèo", "Chăm sóc mèo"];
        }
        if (petType === "dog") {
            return ["Dinh dưỡng cho chó", "Omega 3 cho chó", "Chăm sóc chó"];
        }
        return [
            "Dinh dưỡng thú cưng",
            "Chăm sóc thú cưng",
            "Sản phẩm liên quan",
        ];
    }

    if (contextType === "products") {
        if (language === "en") {
            if (petType === "cat" && productForm === "pate") {
                return ["Cat pate", "Cat food", "Discounted products"];
            }
            if (petType === "cat" && productForm === "kibble") {
                return ["Cat kibble", "Cat pate", "Discounted products"];
            }
            if (petType === "cat" && productForm === "milk") {
                return ["Kitten milk", "Cat food", "Discounted products"];
            }
            if (petType === "cat" && productForm === "toy") {
                return ["Cat toys", "Cat food", "Discounted products"];
            }

            if (petType === "dog" && productForm === "pate") {
                return ["Dog pate", "Dog food", "Discounted products"];
            }
            if (petType === "dog" && productForm === "kibble") {
                return ["Dog kibble", "Dog food", "Discounted products"];
            }
            if (petType === "dog" && productForm === "milk") {
                return ["Puppy milk", "Dog food", "Discounted products"];
            }
            if (petType === "dog" && productForm === "toy") {
                return ["Dog toys", "Dog food", "Discounted products"];
            }

            if (discountMode === "discounted") {
                return petType === "cat"
                    ? ["Cat food on sale", "Cat products", "My orders"]
                    : petType === "dog"
                      ? ["Dog food on sale", "Dog products", "My orders"]
                      : ["Discounted products", "Cat products", "Dog products"];
            }

            if (discountMode === "non_discounted") {
                return petType === "cat"
                    ? ["Cat food", "Full price cat food", "My orders"]
                    : petType === "dog"
                      ? ["Dog food", "Full price dog food", "My orders"]
                      : [
                            "Non-discounted products",
                            "Cat products",
                            "Dog products",
                        ];
            }

            if (petType === "cat") {
                return isLoggedIn
                    ? ["Cat food", "Discounted products", "My orders"]
                    : ["Cat food", "Cat pate", "Discounted products"];
            }

            if (petType === "dog") {
                return isLoggedIn
                    ? ["Dog food", "Discounted products", "My orders"]
                    : ["Dog food", "Dog products", "Discounted products"];
            }

            return isLoggedIn
                ? ["Buy now", "My orders", "Recommended products"]
                : ["Dog products", "Cat products", "Discounted products"];
        }

        if (petType === "cat" && productForm === "pate") {
            return ["Pate cho mèo", "Hạt cho mèo", "Sản phẩm giảm giá"];
        }
        if (petType === "cat" && productForm === "kibble") {
            return ["Hạt cho mèo", "Pate cho mèo", "Sản phẩm giảm giá"];
        }
        if (petType === "cat" && productForm === "milk") {
            return ["Sữa cho mèo con", "Pate cho mèo", "Sản phẩm giảm giá"];
        }
        if (petType === "cat" && productForm === "toy") {
            return ["Đồ chơi cho mèo", "Pate cho mèo", "Sản phẩm giảm giá"];
        }

        if (petType === "dog" && productForm === "pate") {
            return ["Pate cho chó", "Thức ăn cho chó", "Sản phẩm giảm giá"];
        }
        if (petType === "dog" && productForm === "kibble") {
            return ["Hạt cho chó", "Thức ăn cho chó", "Sản phẩm giảm giá"];
        }
        if (petType === "dog" && productForm === "milk") {
            return ["Sữa cho chó con", "Thức ăn cho chó", "Sản phẩm giảm giá"];
        }
        if (petType === "dog" && productForm === "toy") {
            return ["Đồ chơi cho chó", "Thức ăn cho chó", "Sản phẩm giảm giá"];
        }

        if (discountMode === "discounted") {
            return petType === "cat"
                ? ["Pate cho mèo", "Hạt cho mèo", "Đơn hàng của tôi"]
                : petType === "dog"
                  ? ["Thức ăn cho chó", "Sản phẩm cho chó", "Đơn hàng của tôi"]
                  : [
                        "Sản phẩm giảm giá",
                        "Sản phẩm cho mèo",
                        "Sản phẩm cho chó",
                    ];
        }

        if (discountMode === "non_discounted") {
            return petType === "cat"
                ? ["Pate cho mèo giá gốc", "Hạt cho mèo", "Đơn hàng của tôi"]
                : petType === "dog"
                  ? [
                        "Thức ăn cho chó giá gốc",
                        "Sản phẩm cho chó",
                        "Đơn hàng của tôi",
                    ]
                  : [
                        "Sản phẩm không giảm giá",
                        "Sản phẩm cho mèo",
                        "Sản phẩm cho chó",
                    ];
        }

        if (petType === "cat") {
            return isLoggedIn
                ? ["Pate cho mèo", "Hạt cho mèo", "Đơn hàng của tôi"]
                : ["Pate cho mèo", "Hạt cho mèo", "Sản phẩm giảm giá"];
        }

        if (petType === "dog") {
            return isLoggedIn
                ? ["Thức ăn cho chó", "Sản phẩm cho chó", "Đơn hàng của tôi"]
                : ["Thức ăn cho chó", "Sản phẩm cho chó", "Sản phẩm giảm giá"];
        }

        return isLoggedIn
            ? ["Mua ngay", "Đơn hàng của tôi", "Gợi ý cho tôi"]
            : ["Sản phẩm cho chó", "Sản phẩm cho mèo", "Sản phẩm giảm giá"];
    }

    if (contextType === "services") {
        if (intent === "service_booking_intent") {
            return isLoggedIn
                ? language === "en"
                    ? ["Book now", "My bookings", "Spa services"]
                    : ["Đặt lịch ngay", "Booking của tôi", "Dịch vụ spa"]
                : language === "en"
                  ? ["Log in to book", "Grooming services", "Pet hotel"]
                  : [
                        "Đăng nhập để đặt lịch",
                        "Dịch vụ grooming",
                        "Khách sạn thú cưng",
                    ];
        }

        return isLoggedIn
            ? language === "en"
                ? ["Book grooming", "My bookings", "Pet hotel"]
                : ["Đặt grooming", "Booking của tôi", "Khách sạn thú cưng"]
            : language === "en"
              ? ["Grooming services", "Pet spa", "Pet hotel"]
              : ["Dịch vụ grooming", "Spa thú cưng", "Khách sạn thú cưng"];
    }

    if (contextType === "bookings") {
        return language === "en"
            ? ["My latest booking", "Book again", "Services"]
            : ["Booking gần nhất", "Đặt lại", "Xem dịch vụ"];
    }

    if (contextType === "orders") {
        return language === "en"
            ? ["My recent orders", "Buy again", "Products"]
            : ["Đơn hàng gần nhất", "Mua lại", "Xem sản phẩm"];
    }

    if (answerMode === "external_reference") {
        return language === "en"
            ? ["Pet nutrition", "Pet care", "Related products"]
            : [
                  "Dinh dưỡng thú cưng",
                  "Chăm sóc thú cưng",
                  "Sản phẩm liên quan",
              ];
    }

    if (answerMode === "internal_knowledge") {
        return language === "en"
            ? ["Usage guide", "Related products", "Services"]
            : ["Cách sử dụng", "Sản phẩm liên quan", "Dịch vụ"];
    }

    return language === "en"
        ? ["Dog products", "Services", "My bookings"]
        : ["Sản phẩm cho chó", "Dịch vụ", "Booking của tôi"];
};

module.exports = {
    getSuggestionsByContext,
};
