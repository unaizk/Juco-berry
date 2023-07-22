# Juco Berry E-commerce Project

Welcome to Juco Berry, an innovative e-commerce platform built using the MVC (Model-View-Controller) architectural pattern. This project is designed to provide a seamless shopping experience for users and efficient management tools for administrators. Below, we'll outline the key features and functionalities that have been successfully implemented in Juco Berry.

Screenshots
![Juco berry - Google Chrome 15-06-2023 15_21_29](https://github.com/unaizk/Juco-berry/assets/126644119/df681294-37f6-4907-b96d-d1d201687f88)

![Juco berry - Google Chrome 22-07-2023 22_27_51](https://github.com/unaizk/Juco-berry/assets/126644119/80ec9cde-5804-4b92-8c33-b82a98a944d9)

![Juco berry - Google Chrome 22-07-2023 22_27_57](https://github.com/unaizk/Juco-berry/assets/126644119/7c6fba10-3020-462c-a04b-a7d2656dfa38)

![Juco berry - Google Chrome 22-07-2023 22_29_27](https://github.com/unaizk/Juco-berry/assets/126644119/547a7870-0381-4b72-a419-1eb01510f5a0)

![Juco berry - Google Chrome 22-07-2023 22_28_31](https://github.com/unaizk/Juco-berry/assets/126644119/d66ad4e3-5e85-4e2d-87ce-e5a2896a250c)

![Juco berry - Google Chrome 22-07-2023 22_29_39](https://github.com/unaizk/Juco-berry/assets/126644119/1b06fd1e-130e-4500-83fb-c481938e353b)

![Juco berry - Google Chrome 22-07-2023 22_33_11](https://github.com/unaizk/Juco-berry/assets/126644119/d2eb21c0-11e0-4bb2-8a30-e81d6a98f7d1)

![Juco berry - Google Chrome 22-07-2023 22_30_02](https://github.com/unaizk/Juco-berry/assets/126644119/c4352928-af80-438c-8770-954e966c357d)


Getting Started

## User Side Features:

1. **User Authentication and Validation:**
   - Users cannot sign in with the same email more than once to prevent duplicate accounts.
   - Email verification is required for users to activate their accounts and gain access to the platform.
   - User login is secured through OTP (One-Time Password) sent via Twilio, ensuring an additional layer of security.
   - If the user is blocked by the admin, they are prevented from logging in.

2. **Dynamic Product Listing:**
   - Products are listed dynamically on the user side, making it easy for users to browse and explore various offerings.
   - Users can view products categorized by type, allowing for a more organized shopping experience.

3. **Cart Management:**
   - Users can add products to their cart and manage them effectively during their shopping sessions.
   - Offers and coupons can be applied by users to avail discounts and special deals.

4. **Order Management:**
   - Users can track their orders and view their order history.
   - Admins can manage and update the order status efficiently.

5. **Coupon Management:**
   - Admins have the authority to manage coupons, allowing for easy customization of promotions.
   - Offers on specific products and categories can also be configured by the admin.

6. **Address Management:**
   - Users can manage their delivery addresses and set a default address for convenience.
   - The default address can be easily changed or updated.

7. **Wallet Payment:**
   - Users have the option to make payments using their wallet balance.
   - The wallet history is displayed, providing transparency in transaction records.
   - Users can recharge their wallet using Razorpay for seamless fund management.

8. **Secure Cart Functionality:**
   - Users must be logged in to add products to their cart, ensuring a smooth and secure shopping process.
   - Ajax is utilized to increment the quantity of items in the cart without reloading the page, enhancing user experience.

9. **Error Handling and Session Management:**
   - All errors are gracefully caught and directed to an error page to prevent server crashes and ensure a seamless user experience.
   - Sessions for both users and admins are efficiently managed, maintaining data integrity.

10. **User Profile Management:**
    - Users have the ability to edit their profiles and add images to personalize their accounts.

## Admin Side Features:

1. **Product and Category Management:**
   - Admins can add, edit, unlist, and list products with ease.
   - Category management allows for effortless organization of products.

2. **Offer and Coupon Management:**
   - Admins can set up and manage various offers and coupons, providing flexibility in promotional strategies.
   - Category-wise offers can be created to target specific product segments.

3. **Dashboard and Sales Analytics:**
   - The admin dashboard presents essential data, including the total number of users, total sales, today's sales, weekly sales, and monthly sales.
   - Payment methods are displayed for easy reference.
   - Admins have the option to download the total sales report in PDF format.

## Conclusion:

Juco Berry is a feature-rich e-commerce platform that caters to both users and administrators with its wide array of functionalities. The seamless user experience, coupled with efficient management tools, makes Juco Berry an excellent choice for any e-commerce venture. We are committed to continually improving and expanding the platform, providing the best possible shopping experience for our users.


 
